import React, {useEffect, useState} from 'react';
import {compose} from 'redux';

const p1 = async val => {
  console.log('p1', val);
  
  return await (val) + 10;
};

const p2 = async val => {
  console.log('p2', val);
  
  return await (val) + 20;
};

export default props => {
  const [val, setVal] = useState(0);

  useEffect(() => {
    setTimeout(async () => {
      const fn = compose(p1, p2);
      const val = await fn(10);
      setVal(val);
    })
  }, []);  
  

  return <h1>this is home: {val}</h1>;
};