## Nodejs Package
$ npm i [Package]

## Docker Command
$ docker-compose up --build
$ docker-compose up


## データベース (MySQL) へのアクセス
$ docker-compose exec db mysql -uuser -ppassword dev


## データベースのマイグレーション
$ docker-compose exec backend sh -c "node migrate.js"


## 32バイトのランダムなデータを生成し、それを16進数の文字列に変換して出力
$ node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
