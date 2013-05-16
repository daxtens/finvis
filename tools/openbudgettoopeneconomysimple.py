import csv
import sys

filename_new = sys.argv[1]
outfilename = sys.argv[2]

cols = 10
out = [['Expenses'] + [''] * (cols - 1)]
indata = []
stack = []

# stage 1 - read in new sheet
csvfile = csv.reader(open(filename_new, 'rU'))
csvfile.next()  # skip header

for row in csvfile:
    # ... this feels distinctly unpythonic
    if len([x for x in row if x != '']) == 0:
        continue

    indata.append(row)


# stage 2 - break it up into categories
for row in indata:
    #print row
    for i in range(0, 5):

        if not row[i]:
            break
        
        if len(stack) > i and stack[i] == row[i]:
            # we've seen this category before: proceed
            pass
        else:
            outrow = ([''] * (i + 1)) + [row[i]] + ([''] * (cols - i - 2))
            out.append(outrow)
            stack = row[0:i];

    out[-1][6:] = row[5:]


# stage 3 - sum up those categories
# stack stores [row name, row #, value1, value2]
stack = []
for idx, row in enumerate(out):
    #print row
    for i in range(0, 6):
        if not row[i]:
            continue
        
        if len(stack) > i and stack[i][0] == row[i]:
            # we've seen this category before: proceed
            pass
        else:
            # output the sums
            for j in range(i, len(stack)):
                out[stack[j][1]][6] = stack[j][2] / 1000.0
                out[stack[j][1]][7] = stack[j][3] / 1000.0

            stack = stack[0:i]
            stack.append([row[i], idx, 0, 0])

    # add this value to the cumulative sums on the stack
    for i in range(6,8):
        if row[i] == '':
            row[i] = 0
        else:
            row[i] = int(row[i].replace(',',''))
    for i in range(0, len(stack)):
        stack[i][2] = stack[i][2] + row[6]
        stack[i][3] = stack[i][3] + row[7]

for j in range(0, len(stack)):
    out[stack[j][1]][6] = stack[j][2] / 1000.0
    out[stack[j][1]][7] = stack[j][3] / 1000.0
    

# output
csvwriter = csv.writer(open(outfilename,'w'))
csvwriter.writerow(['Category', 'expenses'])
csvwriter.writerow(['source', 'Commonwealth Budget 2013-14'])
csvwriter.writerow([''])
csvwriter.writerow([''] * 6 + ['2012-13','2013-14','info'])
for row in out:
    csvwriter.writerow(row)
