#!/bin/bash

# 数据库初始化脚本
# 使用方法: ./scripts/init-db.sh

# 从环境变量或参数获取数据库连接信息
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-your_database_name}
DB_USER=${DB_USER:-your_username}

echo "开始创建数据库表..."

# 按顺序执行所有表创建SQL文件
for sql_file in sql/tables/*.sql; do
  echo "执行: $sql_file"
  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$sql_file"
  
  if [ $? -eq 0 ]; then
    echo "✅ $sql_file 执行成功"
  else
    echo "❌ $sql_file 执行失败"
    exit 1
  fi
done

echo "🎉 所有数据库表创建完成！"