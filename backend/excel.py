import xlrd
from mongo import *
import re
from bson import json_util

valid_categories = ['expenses', 'revenue', 'assets', 'liabilities']

def import_excel(data):
    """Import an excel spreadsheet in the formats specified in the templates
    and docs. It's pretty brittle.
    Presently, output the file contents."""
    result = {}

    wb = xlrd.open_workbook(file_contents=data)

    if wb.nsheets < 2:
        raise ExcelError("Not enough sheets: there must be at least 2")

    summary_sh = wb.sheet_by_index(0)
    # Name
    if summary_sh.cell_value(rowx=0, colx=0) != "Name":
        raise ExcelError("Summary!A1 is not \"Name\".")

    name = summary_sh.cell_value(rowx=0, colx=1)
    if not name:
        raise ExcelError("No name supplied in Summary!B1.")
    
    # Type
    if summary_sh.cell_value(rowx=1, colx=0) != "Type":
        raise ExcelError("Summary!A2 is not \"Type\"")

    ent_type = summary_sh.cell_value(rowx=1, colx=1)
    if ent_type != "Item" and summary['type'] != "Aggregates":
        raise ExcelError("Type (Summary!B2) is not Item or Aggregates.")
    

    # Units
    if summary_sh.cell_value(rowx=2, colx=0) != "Units":
        raise ExcelError("Summary!A3 is not \"Units\"")

    units = summary_sh.cell_value(rowx=2, colx=1)
    try:
        units = int(units)
    except:
        raise ExcelError("Units (Summary!C2) is not a number.")
    if units < 1:
        raise ExcelError("Units (Summary!C2) is not a valid unit.")
    
    # arbitrary metadata
    # ignore for now

    
    # sanity check with type
    if (ent_type == "Item" and wb.nsheets != 2):
        raise ExcelError("Wrong number of sheets for an Items spreadsheet: expected 2.")
    elif (ent_type == "Aggregates" and wb.sheets > 5):
        raise ExcelError("Wront number of sheets for an Aggregates spreadsheet: expected between 2 and 5")

    # read the remaining sheets:
    sheets=[]
    for sheet in xrange(1, wb.nsheets):
        sh = wb.sheet_by_index(sheet)
        sheets.append(read_sheet(sh, ent_type=="Item", units=units))

    # Prepare the object:
    if ent_type == "Item":
        result = ItemEntity(name=name, username="System", public=True,
                            units=units, category=sheets[0][1],
                            item=sheets[0][0]);
    else:
        result = AggregateEntity(name=name, username="System", public=True,
                                 units=units, aggregates=sheets)
    
    return result

def read_sheet(sh, item, units):
    """Read an individual sheet, either as an item or as an aggregate.
    Both require a Category statement at the beginning.
    Aggregates also require a Name statement in row 2.
    Values are scaled per units."""

    result = {}
    row = 0
    
    # Category
    if sh.cell_value(rowx=0, colx=0) != "Category":
        raise ExcelError(sh.name+"!A1 is not \"Category\".")

    category = sh.cell_value(rowx=0, colx=1).lower()

    if not category in valid_categories:
        raise ExcelError(sh.name+'!B1 is not a valid category.')

    row = row + 1
    
    # Name (aggregate only)
    if not item:
        if sh.cell_value(rowx=1, colx=0) != "Name":
            raise ExcelError(sh.name+' is an aggregate, but A2 is not "Name".')

        name = sh.cell_value(rowx=1, colx=1)
        if not name:
            raise ExcelError(sh.name+': Name not supplied in B2.')

        row = row + 1
    
    # next line is blank
    row = row + 1
    # next line is the years and notes.
    # "YYYY-YY" is a year
    # "YYYY-YY .*" is a year specific note
    # ".*" is an item note
    names = [x.value for x in sh.row(row)]
    names = names
    row = row + 1

    # items proper start here
    stack = []
    items = []
    #print(sh.nrows)
    for row in xrange(row, sh.nrows):
        #print(row)
        #print([json_util.dumps(x.to_mongo()) for x in stack])
        #print(sh.row(row))
        depth = 0
        while not sh.cell_value(row, depth):
            depth = depth + 1


        # pop the stack as required, preserving the topmost item if we're done
        # with it.
        if depth == 0 and len(stack):
            items.append(stack[0])
        stack = stack[:depth]

        # create the item, add it to the topmost's item item's (it applicable)
        # and then push it on to the stack
        item = Item(name=sh.cell_value(row, depth))
        if depth != 0: stack[depth-1].items.append(item)
        stack.append(item)

        for cell in xrange(depth+1, len(names)):           
            if sh.cell_value(row, cell) == '':
                continue
            
            if is_fin_year(names[cell]):
                item.periods.append(
                    Period(name=names[cell],
                           value=sh.cell_value(row, cell) * units))
            else:
                raise NotImplementedException()


    # save the last top-most item touched.
    if (len(stack)):
        items.append(stack[0])
    
    # construct and return result
    if item:
        result = (items[0], category)
    else:
        result = Aggregate(name=name, category=category, items=items)
        
    return result

def is_fin_year(cell):
    #slow?
    # also does not check second year is one after the first year. oh well.
    return (re.match("^[0-9]{4}-[0-9]{2}$", cell) != None)

def export_excel(data):
    raise NotImplementedError()

class ExcelError(Exception):
    pass
