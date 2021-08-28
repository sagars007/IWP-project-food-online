function doSomethingAsync(value) {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log("Resolving " + value);
          resolve(value);
        }, Math.floor(Math.random() * 1000));
      });
    }
    
    function test() {
      let i;
      let promises = [];
      
      for (i = 0; i < 5; ++i) {
        promises.push(doSomethingAsync(i));
      }
      console.log(promises);
      Promise.all(promises)
          .then((results) => {
            console.log("All done", results);
            console.log(promises);
          })
          .catch((e) => {
              // Handle errors here
          });
    }
    
    test();

/*function doSomethingAsync(i){

}*/