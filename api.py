from flask import Flask, request, jsonify
import pyodbc
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
conx = pyodbc.connect(r'DRIVER={ODBC Driver 17 for SQL Server};SERVER=Admin\SQLEXPRESS;DATABASE=QUANLYKHOHANG;UID=minhngoc;PWD=luandz123')
cursor = conx.cursor()

@app.route('/', methods=['GET'])
def home():
    return "Welcome to my API!"

@app.route('/tables', methods=['GET'])
def get_tables():
    cursor.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'")
    tables = [row.TABLE_NAME for row in cursor.fetchall()]
    return jsonify(tables)

@app.route('/table/<table_name>', methods=['GET'])
def get_table_data(table_name):
    cursor.execute(f"SELECT * FROM {table_name}")
    data = [dict(zip([column[0] for column in cursor.description], row)) for row in cursor.fetchall()]
    return jsonify(data)

@app.route('/table/<table_name>', methods=['POST'])
def add_data(table_name):
    data = request.json
    columns = ', '.join(data.keys())
    placeholders = ', '.join('?' * len(data))
    values = list(data.values())
    cursor.execute(f"INSERT INTO {table_name} ({columns}) VALUES ({placeholders})", values)
    conx.commit()
    return '', 204

@app.route('/table/<table_name>/<row_id>', methods=['PUT'])
def edit_data(table_name, row_id):
    data = request.json
    set_clause = ', '.join(f"{column} = ?" for column in data.keys())
    values = list(data.values())
    cursor.execute(f"UPDATE {table_name} SET {set_clause} WHERE {get_primary_key_column(table_name)} = ?", *values, row_id)
    conx.commit()
    return '', 204

def get_primary_key_column(table_name):
    cursor.execute(f"""
        SELECT column_name
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS TC
        JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS KU
        ON TC.CONSTRAINT_TYPE = 'PRIMARY KEY' AND
           TC.CONSTRAINT_NAME = KU.CONSTRAINT_NAME
        WHERE KU.table_name='{table_name}';
    """)
    primary_key = cursor.fetchone()
    return primary_key[0] if primary_key else None

@app.route('/table/<table_name>/<row_id>', methods=['DELETE'])
def delete_data(table_name, row_id):
    primary_key = get_primary_key_column(table_name)

    if not primary_key:
        return jsonify({"error": "No primary key found"}), 400

    cursor.execute(f"DELETE FROM {table_name} WHERE {primary_key} = ?", row_id)
    conx.commit()
    return '', 204

if __name__ == '__main__':
    app.run(debug=True, port=5000)
