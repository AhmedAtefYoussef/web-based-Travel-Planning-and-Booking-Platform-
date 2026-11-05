# xlsx vs reqs.json drift (SHA 6efa26b)

xlsx rows: 115 (Mandatory 104, Bonus 11). reqs.json rows: 115.
Note: CSV row = sheet row (header row 1, blank rows skipped; verify none skipped).

| ID | field | xlsx (sheet!row) | reqs.json |
|---|---|---|---|

Total differences: 0

## Fields only in reqs.json (no xlsx source)
- PAY-01: owner=ahmed; acceptance present=True (xlsx has no owner/priority/acceptance columns)
- PAY-02: owner=ahmed; acceptance present=True (xlsx has no owner/priority/acceptance columns)
- PAY-03: owner=ahmed; acceptance present=True (xlsx has no owner/priority/acceptance columns)
- ITN-18: owner=ahmed; acceptance present=True (xlsx has no owner/priority/acceptance columns)
- GEN-02: owner=ahmed; acceptance present=True (xlsx has no owner/priority/acceptance columns)
- GEN-05: owner=ahmed; acceptance present=True (xlsx has no owner/priority/acceptance columns)
- GEN-07: owner=ahmed; acceptance present=True (xlsx has no owner/priority/acceptance columns)
- GEN-08: owner=ahmed; acceptance present=True (xlsx has no owner/priority/acceptance columns)
- PAY-04: owner=ahmed; acceptance present=True (xlsx has no owner/priority/acceptance columns)
- GEN-13: owner=ahmed; acceptance present=True (xlsx has no owner/priority/acceptance columns)

No "priority" field exists in either source.
