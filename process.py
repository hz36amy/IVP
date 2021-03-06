import pandas as pd
import numpy as np
import os

path = os.path.abspath(r'C:\Users\hz36a\OneDrive\桌面\IVP\Project\data\PRSA_Data_20130301-20170228')
filename_extension = '.csv'

# print(file_allname)

# RQ1 >> combine all datasets
new_filename = 'data.csv'

file_allname = []
for filename in os.listdir(path):
    if os.path.splitext(filename)[1] == filename_extension and filename != new_filename:
        t = os.path.splitext(filename)[0]
        file_allname.append(t + filename_extension)

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

# RQ3 >> day/hour data by year

new_filename = 'hour.csv'
cols_new_name = ['day','hour','value']
df = pd.DataFrame(cols_new_name).T




# RQ4>> yearly data for all pollutions
new_filename = 'air-quality-overall.csv'
cols_new_name = ['year','percentage','pollution']
df = pd.DataFrame(cols_new_name).T

# month = [3,4,5,6,7,8,9,10,11,12,1,2]
year = ['2013-01-01','2014-01-01','2015-01-01','2016-01-01']
pollution = ['PM2.5','PM10','SO2','NO2','CO','O3']

standard = {
    'PM2.5': np.mean(data[(data.year == 2013)]['PM2.5']),
    'PM10': np.mean(data[(data.year == 2013)]['PM10']),
    'SO2': np.mean(data[(data.year == 2013)]['SO2']),
    'NO2': np.mean(data[(data.year == 2013)]['NO2']),
    'CO': np.mean(data[(data.year == 2013)]['CO']),
    'O3': np.mean(data[(data.year == 2013)]['O3'])
}

national_standard_PM25 = 35

try:
    df.to_csv(path + '/' + new_filename, encoding = 'gbk', header = False, index = False)
   
    data = pd.read_csv(path + '/' + 'data.csv')
    for y in year:
        for p in pollution:
            y1 = int(y[:4])

            mean = np.mean(data[data.year == y1][p])

            if(y1 == 2013):
                standard[p] = mean

            perc = (mean/standard[p])*100
            new_row = [y, perc, p]
            new_data = pd.DataFrame(new_row).T
            new_data.to_csv(path + '/' + new_filename, mode = 'a', encoding = 'gbk', header = False, index = False)
            print(y, "finish")
        m_s_0 = (national_standard_PM25/standard['PM2.5'])*100
        new_row = [y, m_s_0, "PM2.5 standard"]
        new_data = pd.DataFrame(new_row).T
        new_data.to_csv(path + '/' + new_filename, mode = 'a', encoding = 'gbk', header = False, index = False)
    
except PermissionError as e:
    print('Error:' + str(type(e)))

# RQ5>> yearly data for human factors
new_filename = 'human-factor.csv'
cols_new_name = ['year','growth','type']
df = pd.DataFrame(cols_new_name).T

year = ['2013-01-01','2014-01-01','2015-01-01','2016-01-01']
data = [
    [6.9, 7.7, 2.2],
    [5.7, 7.4, 1.7],
    [-3.4, 6.9, 0.9],
    [2.8, 6.9, 0.1]
]

new_rows = [
    [year[0], data[0][0], 'Industrial'],
    [year[1], data[1][0], 'Industrial'],
    [year[2], data[2][0], 'Industrial'],
    [year[3], data[3][0], 'Industrial'],
    [year[0], data[0][1], 'GDP'],
    [year[1], data[1][1], 'GDP'],
    [year[2], data[2][1], 'GDP'],
    [year[3], data[3][1], 'GDP'],
    [year[0], data[0][2], 'Population'],
    [year[1], data[1][2], 'Population'],
    [year[2], data[2][2], 'Population'],
    [year[3], data[3][2], 'Population'],
]
try:
    df.to_csv(path + '/' + new_filename, encoding = 'gbk', header = False, index = False)
    for r in new_rows:
        r_data = pd.DataFrame(r).T
        r_data.to_csv(path + '/' + new_filename, mode = 'a', encoding = 'gbk', header = False, index = False)
    print('Finish')
except PermissionError as e:
    print('Error:' + str(type(e)))