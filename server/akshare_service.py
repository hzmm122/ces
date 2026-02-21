import akshare as ak
import pandas as pd
import json
import sys
from datetime import datetime

pd.set_option('display.unicode.ambiguous_as_wide', True)
pd.set_option('display.unicode.east_asian_width', True)
pd.set_option('display.max_rows', None)
pd.set_option('display.max_columns', None)
pd.set_option('display.max_colwidth', 100)
pd.set_option('display.expand_frame_repr', False)

def get_stock_changes():
    try:
        stock_changes_em = ak.stock_changes_em()
        
        result = []
        for index, row in stock_changes_em.iterrows():
            item = {
                '序号': int(index) + 1,
                '股票代码': str(row.get('代码', '')),
                '股票名称': str(row.get('名称', '')),
                '异动时间': str(row.get('时间', '')),
                '异动类型': str(row.get('异动类型', '')),
                '现价': float(row.get('现价', 0)) if pd.notna(row.get('现价')) else 0,
                '涨跌幅': float(row.get('涨跌幅', 0)) if pd.notna(row.get('涨跌幅')) else 0,
                '成交量': float(row.get('成交量', 0)) if pd.notna(row.get('成交量')) else 0,
                '成交额': float(row.get('成交额', 0)) if pd.notna(row.get('成交额')) else 0,
                '异动原因': str(row.get('异动原因', '')),
            }
            result.append(item)
        
        return {
            'success': True,
            'data': result,
            'total': len(result),
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'data': [],
            'total': 0,
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }

def get_stock_suspend():
    try:
        stock_suspend_em = ak.stock_tfp_em()
        
        result = []
        for index, row in stock_suspend_em.iterrows():
            item = {
                '序号': int(index) + 1,
                '股票代码': str(row.get('代码', '')),
                '股票名称': str(row.get('名称', '')),
                '停牌日期': str(row.get('停牌日期', '')),
                '复牌日期': str(row.get('复牌日期', '')),
                '停牌原因': str(row.get('停牌原因', '')),
            }
            result.append(item)
        
        return {
            'success': True,
            'data': result,
            'total': len(result),
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'data': [],
            'total': 0,
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }

if __name__ == '__main__':
    if len(sys.argv) > 1:
        action = sys.argv[1]
        if action == 'changes':
            result = get_stock_changes()
        elif action == 'suspend':
            result = get_stock_suspend()
        else:
            result = get_stock_changes()
    else:
        result = get_stock_changes()
    
    print(json.dumps(result, ensure_ascii=False))
