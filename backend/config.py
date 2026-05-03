"""
配置文件加载模块
"""
import yaml
from pathlib import Path
from typing import Any

CONFIG_FILE = Path(__file__).parent / "config.yaml"


def load_config() -> dict[str, Any]:
    """加载配置文件"""
    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


config = load_config()
