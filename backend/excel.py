import xlrd
import xlwt
from mongo import *
import re
from bson import json_util
from StringIO import StringIO

valid_categories = ['expenses', 'revenue', 'assets', 'liabilities']


def import_excel(data, username):
    """Import an excel spreadsheet in the formats specified in the templates.
    It's pretty brittle.
    Returns the relevant MongoEngine object."""
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
    if ent_type != "Item" and ent_type != "Aggregates":
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
    metadata = {}
    row = 3
    while (row < summary_sh.nrows and
           summary_sh.cell_value(rowx=row, colx=0) != ''):
        key = summary_sh.cell_value(rowx=row, colx=0)
        value = summary_sh.cell_value(rowx=row, colx=0)
        metadata[key] = value
        row = row + 1

    # sanity check with type
    if (ent_type == "Item" and wb.nsheets != 2):
        raise ExcelError(
            "Wrong number of sheets for an Items spreadsheet: expected 2.")
    elif (ent_type == "Aggregates" and wb.nsheets > 5):
        raise ExcelError(
            """Wrong number of sheets for an Aggregates spreadsheet:
            expected between 2 and 5""")

    # read the remaining sheets:
    sheets = []
    for sheet in xrange(1, wb.nsheets):
        sh = wb.sheet_by_index(sheet)
        sheets.append(read_sheet(sh, (ent_type == "Item"), units=units))

    # Prepare the object:
    if ent_type == "Item":
        result = ItemEntity(name=name, username=username, public=False,
                            units=units, category=sheets[0][1],
                            item=sheets[0][0], metadata=metadata)
    else:
        result = AggregateEntity(name=name, username=username, public=False,
                                 units=units, aggregates=sheets,
                                 metadata=metadata)

        # default relations
        result.relations['revenueVexpenses'] = Relation(
            greater='Surplus',
            equal='Balanced',
            less='Deficit')
        result.relations['assetsVliabilities'] = Relation(
            greater='Net Position',
            equal='No net debt',
            less='Net Debt')

    return result


def read_sheet(sh, isItem, units):
    """Read an individual sheet, either as an item or as an aggregate.
    Both require a Category statement at the beginning.
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

    # arbitrary metadata
    metadata = {}
    row = 1
    while (sh.cell_value(rowx=row, colx=0)):
        key = sh.cell_value(rowx=row, colx=0)
        value = sh.cell_value(rowx=row, colx=1)
        metadata[key] = value
        row = row + 1

    # next line is blank
    row = row + 1

    # next line is the years and notes.
    # "YYYY-YY" is a year
    # "YYYY-YY .*" is a year specific note
    # ".*" is an item note
    names = [x.value for x in sh.row(row)]
    cols = []
    for name in names:
        if name == '':
            cols.append(None)
        elif is_fin_year(name):
            cols.append({'period': name, 'type': 'value'})
        elif fin_year_metadata(name) is not None:
            (year, key) = fin_year_metadata(cell)
            cols.append({'period': year, 'type': 'metadata', 'key': key})
        else:
            cols.append({'type': 'metadata', 'key': name})

    #print(names)
    row = row + 1

    # items proper start here
    stack = []
    #print(sh.nrows)
    for row in xrange(row, sh.nrows):
        #print(row)
        #print([json_util.dumps(x.to_mongo()) for x in stack])
        #print(sh.row(row))

        #skip blank rows
        if not [x for x in sh.row(row) if x.ctype != 0]:
            continue

        depth = 0
        while not sh.cell_value(row, depth):
            depth = depth + 1

        # pop the stack as required
        stack = stack[:depth]

        # create the item, add it to the topmost's item item's (it applicable)
        # and then push it on to the stack
        item = Item(name=sh.cell_value(row, depth))
        if depth != 0:
            stack[depth-1].items.append(item)
        else:  # save the sheet metadata on the first item
            item.metadata = metadata
        stack.append(item)

        for cell in xrange(depth+1, len(cols)):
            if sh.cell_value(row, cell) == '':
                continue

            if not cols[cell]:
                continue

            if cols[cell]['type'] == 'value':
                item.periods[cols[cell]['period']] = Period(
                    value=sh.cell_value(row, cell) * units)
            else:  # type metadata
                if 'period' in cols[cell]:
                    item.periods[cols[cell]['period']] \
                        .metadata[cols[cell]['key']] = sh.cell_value(row, cell)
                else:
                    item.metadata[cols[cell]['key']] = sh.cell_value(row, cell)

    # construct and return result
    if isItem:
        result = (stack[0], category)
    else:
        result = Aggregate(name=stack[0]['name'], category=category,
                           items=stack[0]['items'],
                           periods=stack[0]['periods'],
                           metadata=metadata)

    return result


def is_fin_year(cell):
    #slow?
    # also does not check second year is one after the first year. oh well.
    return (re.match("^[0-9]{4}-[0-9]{2}$", cell) is not None)


def fin_year_metadata(cell):
    # all the issues of is_fin_year and more!
    result = re.match("^([0-9]{4}-[0-9]{2}) (.*)$", cell)
    if result is None:
        return None
    else:
        return result.groups()


def export_excel(data):
    wb = xlwt.Workbook()

    summary_sheet = wb.add_sheet('Summary')

    summary_sheet.write(0, 0, "Name")
    summary_sheet.write(0, 1, data.name)
    summary_sheet.write(1, 0, "Type")
    if type(data) is ItemEntity:
        summary_sheet.write(1, 1, "Item")
    else:
        summary_sheet.write(1, 1, "Aggregates")
    summary_sheet.write(2, 0, "Units")
    summary_sheet.write(2, 1, data.units)
    summary_sheet.write(2, 2, "s")

    row = 3
    for key in data.metadata:
        summary_sheet.write(row, 0, key)
        summary_sheet.write(row, 1, data.metadata[key])
        row = row + 1

    if type(data) is ItemEntity:
        sh = wb.add_sheet('Item')
        write_sheet(sh, data.category, data.item, data.units)
    else:
        for a in data.aggregates:
            print a
            sh = wb.add_sheet(a.category)
            write_sheet(sh, a.category, a, data.units)

    result = StringIO()
    wb.save(result)
    return result.getvalue()


def write_sheet(sh, category, data, units):
    sh.write(0, 0, "Category")
    sh.write(0, 1, category)
    row = 1
    for key in data.metadata:
        sh.write(row, 0, key)
        sh.write(row, 1, data.metadata[key])
        row = row + 1

    # blank line
    row = row + 1

    # what is the max depth?
    col = max_depth(data)
    headings_start = col
    headings = [''] * col
    # period and period metadata then generic metadata
    periods = data.periods.keys()
    periods.sort()
    for p in periods:
        headings.append({'kind': 'period', 'period': p})
        sh.write(row, col, p)
        col = col + 1
        # do we have period metadata?
        for pm in data.periods[p].metadata:
            headings.append({'kind': 'periodmeta', 'period': p, 'value': pm})
            sh.write(row, col, p + ' ' + pm)
            col = col + 1

    # now the general metadata
    # we don't read this from the top level item
    # to avoid the metadata we put at the top of the sheet
    # we do have to check literally every other one though
    if len(data.items):
        keys = metadata_keys(data).difference(set(data.metadata.keys()))
        for m in keys:
            headings.append({'kind': 'metadata', 'value': m})
            sh.write(row, col, m)
            col = col + 1

    print(headings)
    # now for the data
    row = row + 1

    stack = [(data, 0)]
    while len(stack):
        item, depth = stack.pop()
        for child in item.items:
            stack.append((child, depth + 1))

        sh.write(row, depth, item.name)
        # write out the values
        for col in xrange(headings_start, len(headings)):
            kind = headings[col]['kind']
            if kind == 'period':
                period = headings[col]['period']
                sh.write(row, col, item.periods[period].value / units)
            elif kind == 'periodmeta':
                val = headings[col]['value']
                period = headings[col]['period']
                if val in items.periods[period].metadata:
                    sh.write(row, col, item.periods[period].metadata[val])
            else:  # assume metadata
                val = headings[col]['value']
                if val in item.metadata:
                    sh.write(row, col, item.metadata[val])

        row = row + 1


def max_depth(item):
    if len(item.items):
        return max([max_depth(x) for x in item.items]) + 1
    return 1


def metadata_keys(item):
    result = set(item.metadata.keys())
    for child in item.items:
        result = result.union(metadata_keys(child))
    return result


class ExcelError(Exception):
    pass
