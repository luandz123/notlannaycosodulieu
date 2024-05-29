import pyodbc

# Kết nối đến cơ sở dữ liệu SQL Server
conn = pyodbc.connect(r'DRIVER={ODBC Driver 17 for SQL Server};SERVER=Admin\SQLEXPRESS;DATABASE=QUANLYKHOHANG;UID=minhngoc;PWD=luandz123')
cursor = conn.cursor()

# Lấy tất cả các bảng từ cơ sở dữ liệu
cursor.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'")
tables = cursor.fetchall()

# Duyệt qua từng bảng và in ra tên bảng, tên cột và kiểu dữ liệu của từng cột
for table in tables:
    table_name = table[0]
    print(f"Table: {table_name}")
    
    cursor.execute(f"""
        SELECT COLUMN_NAME, DATA_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = '{table_name}'
    """)
    columns = cursor.fetchall()
    
    for column in columns:
        column_name = column[0]
        data_type = column[1]
        print(f"    Column: {column_name}, Data Type: {data_type}")

# Đóng kết nối
conn.close()
