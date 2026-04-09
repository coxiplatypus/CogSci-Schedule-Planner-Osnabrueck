// Parse the official Grade Calculator .xlsx to extract completed LP per area
function parseGradeCalc(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=(e)=>{
      try{
        const wb=XLSX.read(new Uint8Array(e.target.result),{type:"array"});
        const ws=wb.Sheets[wb.SheetNames[0]];
        const b1=(ws["B1"]&&ws["B1"].v)||"";
        if(!b1.toString().includes("Grade Calculator"))return reject("This doesn't look like the official Grade Calculator spreadsheet. Expected 'Grade Calculator' in cell B1.");
        const v=(ref)=>{const c=ws[ref];return(c&&typeof c.v==="number")?c.v:0};
        resolve({"AI/ML":v("C11"),"Psych/Lang":v("G11"),"Neuroscience":v("K11"),"Ethics/Mind":v("C20"),"Methods":v("G20"),"Free Elective":v("K20"),"Study Project":v("G25"),"Colloquium":0,"BSc Core":0});
      }catch(err){reject("Failed to parse file: "+err.message)}
    };
    reader.onerror=()=>reject("Failed to read file");
    reader.readAsArrayBuffer(file);
  });
}
