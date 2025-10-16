// pptx-utils.js - PPT generation shared by supervisor & admin
// Each slide is a single activity with up to 9 photos placed in 3x3 grid.
// Each image size: width 2.98 in, height 1.68 in
async function generateMultiSlidePPT(records, filename){
  if(!records || !records.length) return alert('No records to create PPT');
  const pptx = new PptxGenJS();
  const imgW = 2.98, imgH = 1.68;
  const cols = 3, rows = 3;
  const gap = 0.15; // inches, consistent spacing to avoid overlap
  const slideW = pptx.width || 10, slideH = pptx.height || 5.625;
  const totalW = cols*imgW + (cols-1)*gap;
  const totalH = rows*imgH + (rows-1)*gap;
  const marginX = Math.max(0.3, (slideW - totalW)/2);
  const marginY = 0.9; // leave space at top for header

  for(const rec of records){
    const slide = pptx.addSlide();
    // header
    slide.addText(rec.activity + ' — ' + (rec.supName || ''), {x:0.3, y:0.2, fontSize:14, bold:true});
    if(rec.notes) slide.addText('Notes: ' + rec.notes, {x:0.3, y:0.5, fontSize:9, color:'666666'});
    // place images
    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        const idx = r*cols + c;
        const step = rec.steps[idx];
        const x = marginX + c*(imgW + gap);
        const y = marginY + r*(imgH + gap);
        if(!step) continue;
        try{
          slide.addImage({data: step.imgData, x: x, y: y, w: imgW, h: imgH, sizing:{type:'contain', w:imgW, h:imgH}});
        }catch(e){
          console.error('Image add error', e);
        }
        // caption centered
        slide.addText((step.desc || `Photo ${idx+1}`), {x: x, y: y + imgH + 0.03, w: imgW, fontSize:9, align:'center'});
      }
    }
  }
  await pptx.writeFile({fileName: filename || `EHS_${(new Date()).toISOString().slice(0,10)}.pptx`});
}
