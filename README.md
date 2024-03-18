## Docker Command
$ docker-compose up --build
$ docker-compose up


## データベース (MySQL) へのアクセス
$ docker-compose exec db mysql -uuser -ppassword dev


## データベースのマイグレーション
$ docker-compose exec backend sh -c "node migrate.js"

