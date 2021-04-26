import pandas as pd
import os

path = os.path.abspath(r'C:\Users\hz36a\OneDrive\桌面\IVP\Project\data\PRSA_Data_20130301-20170228')
filename_extension = '.csv'
new_filename = 'data.csv'

file_allname = []
for filename in os.listdir(path):
    if os.path.splitext(filename)[1] == filename_extension and filename != new_filename:
        t = os.path.splitext(filename)[0]
        file_allname.append(t + filename_extension)
# print(file_allname)

df = pd.read_csv(path + '/' + file_allname[0])
cols_new_name = list(df.columns.values)
# print(cols_new_name)
df = pd.DataFrame(cols_new_name).T

try:
    df.to_csv(path + '/' + new_filename, encoding = 'gbk', header = False, index = False)
    for fn in file_allname:
        data = pd.read_csv(path + '/' + fn)
        print('combine >>' + fn)
        data = data.iloc[:, :]
        data.to_csv(path + '/' + new_filename, mode = 'a', encoding = 'gbk', header = False, index = False)
    print('Finish')
except PermissionError as e:
    print('Error:' + str(type(e)))