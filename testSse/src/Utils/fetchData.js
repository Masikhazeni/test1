export const exerciseOptions = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
    'X-RapidAPI-Key':'707deb81demshf508a1b12f8a459p119d46jsn1db70b316bf3' ,
  },
};

export const fetchData = async (url, options) => {
  const res = await fetch(url, options);
  const data = await res.json();

  return data;
};
export default fetchData;
// // const url = 'https://exercisedb.p.rapidapi.com/exercises/bodyPartList';
// export const exerciseOptions = {
//     method: 'GET',
//     headers: {
//       'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
//       'X-RapidAPI-Key': process.env.REACT_APP_RAPID_API_KEY,
//     },
//   };
// const fetchData=async(url,option={})=>{
//   try {
//       const res=await fetch(url,option)
//       const data=await res.json()
//       return data
//   } catch (error) {
//       return {success:false,message:error}
//   }
// }

// export default fetchData