npm pack .

PACKAGE=`find . -name webpack-util-cleantmp-*`

cd integration

npm install
npm install ../$PACKAGE

./node_modules/.bin/webpack

cd ../
rm $PACKAGE

