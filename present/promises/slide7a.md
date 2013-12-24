##Composition

A serial process from an array of promises passing values

function asyncEvent(n) {
  return new Promise(function (resolve) {
    resolve(n);
  });
}