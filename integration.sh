rm -rf integration/dist
npm pack .

PACKAGE=`find . -name webpack-util-cleantmp-*`

cd integration

npm install
npm install ../$PACKAGE
rm ../$PACKAGE

./node_modules/.bin/webpack
OUTPUT=$(ls dist)

cd ../

EXPECTED="bundle.js foo.json"
if [ "${#EXPECTED}" != "${#OUTPUT}" ]; then
  exit 1;
fi
