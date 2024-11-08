import React from 'react'
import { useState,useContext,useEffect } from 'react'
import axios from 'axios';
import { GlobalState } from '../../GlobalState';
import ProductList from '../mainpages/utils/ProductList';


const Ethnic = () => {

  const state=useContext(GlobalState);
  
  const [products,setproducts]=state.productAPI.products;
  

  const getProducts=async()=>{
      const res=await axios.get('/api/ethnicProducts');
      //console.log(res.data.products);
      setproducts(res.data.products);
      console.log(products);
      
  }
  useEffect(()=>{
      getProducts();
      
  },[])


  return (
    <div className='products'> 
      {
        products.map((product)=>{
          return <ProductList key={product._id} product={product}/>

        })
      }
    </div>
  )
}

export default Ethnic
// const [products,setProducts]=useState([]);

    // const res=await axios.get('/api/casualProducts');
    // console.log(res.data);