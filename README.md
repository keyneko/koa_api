# 查看Ubuntu版本信息
```bash
ssh ubuntu@118.24.152.123 f3WmQEB-LYm28xw
lsb_release -a
```

# 安装deb包
```bash
sudo dpkg -i mongodb-org-server_6.0.12_amd64.deb
sudo dpkg -i mongodb-mongosh_2.1.1_amd64.deb
```

# 命令行安装mongodb
```bash
sudo apt-get autoremove
sudo apt-get update
sudo apt-get install -y mongodb
sudo apt-get install -y mongodb-server-core
sudo apt-get install -y mongodb-mongosh
sudo vim /etc/systemd/system/mongod.service
```
```tcl
[Unit]
Description=MongoDB Database Server
Documentation=https://docs.mongodb.org/manual
After=network.target

[Service]
User=mongodb
Group=mongodb
ExecStart=/usr/bin/mongod --config /etc/mongod.conf
PIDFile=/var/run/mongodb/mongod.pid
LimitFSIZE=infinity
LimitCPU=infinity
LimitAS=infinity
LimitNOFILE=64000
LimitNPROC=64000
LimitMEMLOCK=infinity
TasksMax=infinity
TasksAccounting=false

[Install]
WantedBy=multi-user.target
```
```bash
# 重新加载 systemd 的配置并启用服务
sudo systemctl daemon-reload
sudo systemctl enable mongod
sudo systemctl start mongod
# 检查 MongoDB 服务的状态
sudo systemctl status mongod
# 确保 MongoDB 的数据目录访问权限
sudo mkdir -p /var/lib/mongodb
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chmod 700 /var/lib/mongodb
mongod --version
mongosh "mongodb://localhost:27017/test"
```
```tcl
# mongod.conf

# network interfaces
net:
  port: 27017
  bindIp: 0.0.0.0
  
security: 
  authorization: enabled
```
```javascript
// 开启身份验证
use admin
db.createUser({
  user: "admin",
  pwd: "JTewp9ZKKAag22u",
  roles: [
    { role: "root", db: "admin" }
  ]
})

db.auth("admin", "JTewp9ZKKAag22u")

use test
db.createUser({
  user: "test",
  pwd: "f3WmQEB-LYm28xw",
  roles: [
    { role: "readWrite", db: "test" }
  ]
})

db.auth("test", "f3WmQEB-LYm28xw")

// 查表
show collections
db.roles.drop()
db.users.drop()
db.users.find()
db.users.find({ name: "John Doe" })
```

# 杀死进程
```bash
ps aux | grep 'npm run start:prod'
sudo lsof -i :27017
sudo kill -9 10303

# 重启mongod失败
sudo cat /var/log/mongodb/mongod.log
rm /var/lib/mongodb/mongod.lock
rm /tmp/mongodb-27017.sock
sudo systemctl start mongod
```

# 安装nginx
```bash
sudo apt update
sudo apt install nginx
sudo ufw allow 'Nginx Full'
```

# 配置nginx
```bash
# 复制默认配置文件作为模板
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/koa_app
# 创建一个链接到 sites-enabled 目录来启用你的新配置
sudo ln -s /etc/nginx/sites-available/koa_app /etc/nginx/sites-enabled/
sudo vim /etc/nginx/sites-available/koa_app
```
```bash
server {
    listen 80;
    server_name 118.24.152.123;

    # 静态文件服务配置
    location / {
        root /home/ubuntu/app/koa_app;
        try_files $uri /index.html;
    }

    # API 代理配置
    location /api/ {
        proxy_pass http://localhost:4000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 静态文件目录
    location /uploads {
        alias /home/ubuntu/app/koa_api/public/uploads;
        autoindex off;
    }
}
```
```bash
#检查配置文件是否有语法错误
sudo nginx -t
sudo nginx -s reload
sudo systemctl status nginx
#重启 Nginx 以应用更改
sudo systemctl restart nginx
sudo systemctl reload nginx
# 查看 Nginx 的错误日志
sudo tail -f /var/log/nginx/error.log
# 确保 Nginx 用户（通常是 www-data）有权限访问 
sudo chown -R www-data:www-data /home/ubuntu/app/koa_app
# ubuntu用户
sudo chown -R ubuntu:ubuntu /home/ubuntu/app/koa_app/
ls -l koa_app
ps aux | grep nginx
```

# 启动app
```bash
pm2 stop watchdog.js 
pm2 start watchdog.js 
```