"""
初始化数据库脚本
创建数据库和所有表
"""
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.exc import ProgrammingError, OperationalError
from config import config
from models import Base

def create_database():
    """创建数据库（如果不存在）"""
    db_config = config["database"]
    
    # 连接到 postgres 默认数据库来创建新数据库
    admin_url = (
        f"postgresql://{db_config['user']}:{db_config['password']}"
        f"@{db_config['host']}:{db_config['port']}/postgres"
    )
    
    try:
        admin_engine = create_engine(admin_url, isolation_level="AUTOCOMMIT")
        with admin_engine.connect() as conn:
            # 检查数据库是否存在
            result = conn.execute(
                text(f"SELECT 1 FROM pg_database WHERE datname = '{db_config['database']}'")
            )
            exists = result.fetchone()
            
            if not exists:
                print(f"创建数据库: {db_config['database']}")
                conn.execute(text(f"CREATE DATABASE {db_config['database']}"))
                print("✓ 数据库创建成功")
            else:
                print(f"✓ 数据库 {db_config['database']} 已存在")
        
        admin_engine.dispose()
        return True
        
    except OperationalError as e:
        print(f"✗ 无法连接到 PostgreSQL: {e}")
        print("\n请确保：")
        print("1. PostgreSQL 服务正在运行")
        print("2. config.yaml 中的数据库配置正确")
        print(f"3. 用户 '{db_config['user']}' 有创建数据库的权限")
        return False
    except Exception as e:
        print(f"✗ 创建数据库时出错: {e}")
        return False


def create_tables():
    """创建所有表"""
    try:
        from database import engine
        
        print("\n创建数据库表...")
        Base.metadata.create_all(bind=engine)
        print("✓ 所有表创建成功")
        
        # 显示创建的表
        print("\n已创建的表:")
        for table_name in Base.metadata.tables.keys():
            print(f"  - {table_name}")
        
        return True
        
    except Exception as e:
        print(f"✗ 创建表时出错: {e}")
        return False


def main():
    print("=" * 50)
    print("初始化 PostgreSQL 数据库")
    print("=" * 50)
    
    # 步骤 1: 创建数据库
    if not create_database():
        sys.exit(1)
    
    # 步骤 2: 创建表
    if not create_tables():
        sys.exit(1)
    
    print("\n" + "=" * 50)
    print("✓ 数据库初始化完成！")
    print("=" * 50)


if __name__ == "__main__":
    main()
