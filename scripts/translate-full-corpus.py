"""Compatibility entry point: Chinese is translated directly from French using GPT-6 Astra.

Uses the current trilingual corpus as input, preserving English. See README for
API setup and staging validation. The former English-pivot path is removed.
"""
import runpy
from pathlib import Path
runpy.run_path(str(Path(__file__).with_name('translate-direct-zh.py')),run_name='__main__')
