#!/usr/bin/env python3
import sys, json, tomllib
from datetime import date, datetime

def date_converter(obj):
    if isinstance(obj, (date, datetime)):
        return obj.isoformat()
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

with open(sys.argv[1], 'rb') as f:
    print(json.dumps(tomllib.load(f), default=date_converter, ensure_ascii=False))
