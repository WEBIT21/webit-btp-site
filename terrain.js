import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {Sky} from "three/addons/objects/Sky.js";
const stage=document.getElementById("rstage"),cv=document.getElementById("rcv");
if(stage&&cv){
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const R=new THREE.WebGLRenderer({canvas:cv,antialias:true,powerPreference:"high-performance"});
R.setPixelRatio(Math.min(devicePixelRatio,1.75));R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=.42;R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
const S=new THREE.Scene();const cam=new THREE.PerspectiveCamera(40,1,.3,2000);cam.position.set(40,6,46);
const ctl=new OrbitControls(cam,cv);ctl.target.set(0,9,0);ctl.enableDamping=true;ctl.dampingFactor=.06;ctl.minDistance=14;ctl.maxDistance=90;ctl.minPolarAngle=1.05;ctl.maxPolarAngle=1.53;ctl.enablePan=false;ctl.autoRotate=!reduce;ctl.autoRotateSpeed=.35;ctl.rotateSpeed=.55;
cv.addEventListener("pointerdown",()=>ctl.autoRotate=false);
/* sky + sun */
const sky=new Sky();sky.scale.setScalar(4000);S.add(sky);const su=sky.material.uniforms;su.turbidity.value=6;su.rayleigh.value=1.6;su.mieCoefficient.value=.004;su.mieDirectionalG.value=.85;
const sunV=new THREE.Vector3();const sun=new THREE.DirectionalLight(0xffffff,3.2);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-40,right:40,top:40,bottom:-40,near:1,far:200});sun.shadow.bias=-.0003;sun.shadow.normalBias=.03;S.add(sun,sun.target);
const hemi=new THREE.HemisphereLight(0xcfe3ff,0x6b5a45,.3);S.add(hemi);
const pm=new THREE.PMREMGenerator(R);let envRT=null;const envScene=new THREE.Scene();const skyE=new Sky();skyE.scale.setScalar(1000);envScene.add(skyE);
function setTime(h){/* h: 0 morning .. 1 evening */const el=THREE.MathUtils.lerp(28,6,h),az=THREE.MathUtils.lerp(120,250,h);sunV.setFromSphericalCoords(1,THREE.MathUtils.degToRad(90-el),THREE.MathUtils.degToRad(az));
 su.sunPosition.value.copy(sunV);skyE.material.uniforms.sunPosition.value.copy(sunV);for(const k of ["turbidity","rayleigh","mieCoefficient","mieDirectionalG"])skyE.material.uniforms[k].value=su[k].value;
 sun.position.copy(sunV).multiplyScalar(80);sun.color.setHSL(.09,.75,THREE.MathUtils.lerp(.92,.7,h));sun.intensity=THREE.MathUtils.lerp(2.6,2.0,h);R.toneMappingExposure=THREE.MathUtils.lerp(.4,.5,h);
 if(envRT)envRT.dispose();envRT=pm.fromScene(envScene);S.environment=envRT.texture;S.fog.color.setHSL(.6,.25,THREE.MathUtils.lerp(.78,.62,h))}
S.fog=new THREE.Fog(0xc9d4de,90,420);
/* procedural textures */
function tex(w,h,draw,rep){const c=document.createElement("canvas");c.width=w;c.height=h;const x=c.getContext("2d");draw(x,w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;if(rep)t.repeat.set(rep[0],rep[1]);t.anisotropy=8;return t}
const rnd=(()=>{let s=11;return()=>(s=s*16807%2147483647)/2147483647})();
function noise(x,w,h,base,amp,n){x.fillStyle=base;x.fillRect(0,0,w,h);for(let i=0;i<n;i++){const v=(rnd()-.5)*amp;x.fillStyle=`rgba(${v>0?255:0},${v>0?255:0},${v>0?255:0},${Math.abs(v)})`;x.fillRect(rnd()*w,rnd()*h,1+rnd()*2,1+rnd()*2)}}
const concTex=tex(512,512,(x,w,h)=>{noise(x,w,h,"#a29c91",.2,60000);for(let i=0;i<14;i++){x.fillStyle=`rgba(80,70,60,${.04+rnd()*.05})`;x.beginPath();x.ellipse(rnd()*w,rnd()*h,20+rnd()*80,10+rnd()*40,rnd()*3,0,7);x.fill()}x.strokeStyle="rgba(60,55,50,.12)";for(let y=0;y<h;y+=128){x.beginPath();x.moveTo(0,y);x.lineTo(w,y);x.stroke()}});
const concM=new THREE.MeshStandardMaterial({map:concTex,roughness:.92,metalness:0,color:0xf3ece2,envMapIntensity:.45});
const slabM=concM.clone();slabM.map=concTex.clone();slabM.map.repeat.set(3,2);slabM.map.needsUpdate=true;
const plyTex=tex(512,256,(x,w,h)=>{x.fillStyle="#b9773f";x.fillRect(0,0,w,h);for(let i=0;i<220;i++){x.strokeStyle=`rgba(90,45,15,${.05+rnd()*.12})`;x.lineWidth=1+rnd()*2;const y=rnd()*h;x.beginPath();x.moveTo(0,y);x.bezierCurveTo(w*.3,y+(rnd()-.5)*14,w*.6,y+(rnd()-.5)*14,w,y+(rnd()-.5)*8);x.stroke()}x.fillStyle="#c2410c";x.fillRect(0,0,w,10);x.fillRect(0,h-10,w,10)});
const plyM=new THREE.MeshStandardMaterial({map:plyTex,roughness:.8});
const gravTex=tex(512,512,(x,w,h)=>{noise(x,w,h,"#9a8a72",.35,90000);for(let i=0;i<2500;i++){x.fillStyle=`hsl(30,${8+rnd()*10}%,${45+rnd()*25}%)`;x.beginPath();x.arc(rnd()*w,rnd()*h,.8+rnd()*2.2,0,7);x.fill()}},[40,40]);
const groundM=new THREE.MeshStandardMaterial({map:gravTex,roughness:1,envMapIntensity:.75});
const grassTex=tex(256,256,(x,w,h)=>{noise(x,w,h,"#5d6b3c",.3,40000)},[60,60]);
const asphTex=tex(256,256,(x,w,h)=>{noise(x,w,h,"#4a4b4e",.25,40000)},[30,2]);
const meshTex=tex(64,64,(x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle="#fff";x.lineWidth=3;for(let i=0;i<=w;i+=16){x.beginPath();x.moveTo(i,0);x.lineTo(i,h);x.stroke();x.beginPath();x.moveTo(0,i);x.lineTo(w,i);x.stroke()}});
const steelM=new THREE.MeshStandardMaterial({color:0x9aa1a8,metalness:.85,roughness:.35});
const galvM=new THREE.MeshStandardMaterial({color:0xb8bdc2,metalness:.9,roughness:.45});
const rebarM=new THREE.MeshStandardMaterial({color:0x6b4a35,metalness:.6,roughness:.7});
const craneM=new THREE.MeshStandardMaterial({color:0xd9a515,metalness:.4,roughness:.5});
const glassM=new THREE.MeshPhysicalMaterial({color:0x9fb4c4,metalness:.1,roughness:.05,transmission:0,transparent:true,opacity:.55,envMapIntensity:1.4,clearcoat:1});
const whiteM=new THREE.MeshStandardMaterial({color:0xf2efe9,roughness:.6});
const plankTex=tex(256,64,(x,w,h)=>{x.fillStyle="#9c7a52";x.fillRect(0,0,w,h);for(let i=0;i<60;i++){x.strokeStyle=`rgba(60,40,20,${.08+rnd()*.12})`;const y=rnd()*h;x.beginPath();x.moveTo(0,y);x.lineTo(w,y+(rnd()-.5)*4);x.stroke()}});const woodM=new THREE.MeshStandardMaterial({map:plankTex,roughness:.9});
/* ground */
const g=new THREE.Mesh(new THREE.CircleGeometry(600,64),new THREE.MeshStandardMaterial({map:grassTex,roughness:1,envMapIntensity:.4}));g.rotation.x=-Math.PI/2;g.receiveShadow=true;S.add(g);
const site=new THREE.Mesh(new THREE.PlaneGeometry(70,56),groundM);site.rotation.x=-Math.PI/2;site.position.y=.02;site.receiveShadow=true;S.add(site);
const road=new THREE.Mesh(new THREE.PlaneGeometry(600,9),new THREE.MeshStandardMaterial({map:asphTex,roughness:.95}));road.rotation.x=-Math.PI/2;road.position.set(0,.03,34);road.receiveShadow=true;S.add(road);
/* helpers */
const up=new THREE.Vector3(0,1,0),tmpM=new THREE.Matrix4(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
function bars(list,r,mat,seg=6){const geo=new THREE.CylinderGeometry(r,r,1,seg);const im=new THREE.InstancedMesh(geo,mat,list.length);list.forEach((b,i)=>{const a=b[0],c=b[1],d=new THREE.Vector3().subVectors(c,a),L=d.length();q.setFromUnitVectors(up,d.normalize());sc.set(1,L,1);tmpM.compose(new THREE.Vector3().addVectors(a,c).multiplyScalar(.5),q,sc);im.setMatrixAt(i,tmpM)});im.castShadow=true;im.receiveShadow=true;return im}
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
/* building */
const FL=7,FH=3.1,BW=18,BD=11,bld=new THREE.Group();S.add(bld);const floors=[];
const colG=new THREE.BoxGeometry(.45,FH-.28,.45),slabG=new THREE.BoxGeometry(BW+.8,.28,BD+.8);
for(let f=0;f<FL;f++){const fg=new THREE.Group();fg.position.y=f*FH;bld.add(fg);
 const s=new THREE.Mesh(slabG,slabM);s.position.y=FH-.14;s.castShadow=s.receiveShadow=true;fg.add(s);
 for(let i=0;i<5;i++)for(let j=0;j<3;j++){const c=new THREE.Mesh(colG,concM);c.position.set(-BW/2+.5+i*(BW-1)/4,(FH-.28)/2,-BD/2+.5+j*(BD-1)/2);c.castShadow=c.receiveShadow=true;fg.add(c)}
 /* finished facade */
 const fac=new THREE.Group();fg.add(fac);
 const gl=new THREE.Mesh(new THREE.BoxGeometry(BW-.6,FH-.5,BD-.6),glassM);gl.position.y=(FH-.28)/2;fac.add(gl);
 for(let m=0;m<=8;m++){const mu=new THREE.Mesh(new THREE.BoxGeometry(.08,FH-.5,.12),whiteM);mu.position.set(-BW/2+.3+m*(BW-.6)/8,(FH-.28)/2,BD/2-.25);fac.add(mu)}
 const balc=new THREE.Mesh(new THREE.BoxGeometry(BW+1.6,.2,1.9),whiteM);balc.position.set(0,FH-.3,BD/2+.9);balc.castShadow=true;fac.add(balc);
 const rail=new THREE.Mesh(new THREE.BoxGeometry(BW+1.6,1,.04),glassM);rail.position.set(0,FH+.3,BD/2+1.82);fac.add(rail);
 const blades=[];for(let k=0;k<6;k++){const bl=new THREE.Mesh(new THREE.BoxGeometry(.12,FH,.35),woodM);bl.position.set(BW/2-.4-k*.45,FH/2,BD/2+.2);bl.castShadow=true;fac.add(bl)}
 fg.userData={fac};floors.push(fg)}
const roof=new THREE.Group();roof.position.y=FL*FH;bld.add(roof);
{const p1=new THREE.Mesh(new THREE.BoxGeometry(6,2.6,5),whiteM);p1.position.set(-4,1.3,-1.5);p1.castShadow=true;roof.add(p1);const pl=new THREE.Mesh(new THREE.BoxGeometry(BW-2,.6,1.2),new THREE.MeshStandardMaterial({color:0x5f7a3e,roughness:1}));pl.position.set(0,.3,BD/2-.4);roof.add(pl)}
/* under-construction kit (moves to current level) */
const kit=new THREE.Group();bld.add(kit);
{const rb=[];for(let i=0;i<5;i++)for(let j=0;j<3;j++)for(let k=0;k<4;k++){const x=-BW/2+.5+i*(BW-1)/4+(k%2-.5)*.25,z=-BD/2+.5+j*(BD-1)/2+(k>1?.12:-.12);rb.push([V(x,0,z),V(x,1.6,z)])}kit.add(bars(rb,.02,rebarM,5));
 for(let i=0;i<5;i++)for(let j=0;j<3;j++){if((i+j)%2)continue;const fw=new THREE.Mesh(new THREE.BoxGeometry(.75,2.6,.75),plyM);fw.position.set(-BW/2+.5+i*(BW-1)/4,1.3,-BD/2+.5+j*(BD-1)/2);fw.castShadow=true;kit.add(fw)}
 const props=[];for(let x=-BW/2+1;x<BW/2;x+=1.8)for(let z=-BD/2+1;z<BD/2;z+=1.8)props.push([V(x,-FH+.28,z),V(x,-.05,z)]);kit.add(bars(props,.03,galvM,5));
 const deck=new THREE.Mesh(new THREE.BoxGeometry(BW-2,.05,BD-2),plyM);deck.position.y=-.02;kit.add(deck)}
/* scaffolding + net on front & left */
const scaf=new THREE.Group();bld.add(scaf);
function buildScaf(levels){scaf.clear();const L=[],z0=BD/2+2.2,H=levels*FH+1;for(let x=-BW/2;x<=BW/2+.01;x+=2.5){L.push([V(x,0,z0),V(x,H,z0)],[V(x,0,z0+1),V(x,H,z0+1)])}for(let y=.2;y<=H;y+=2){L.push([V(-BW/2,y,z0),V(BW/2,y,z0)],[V(-BW/2,y,z0+1),V(BW/2,y,z0+1)])}for(let x=-BW/2;x<BW/2;x+=5)L.push([V(x,0,z0+1),V(x+5,Math.min(H,10),z0+1)]);
 scaf.add(bars(L,.025,galvM,6));for(let y=2.2;y<=H;y+=2){const pk=new THREE.Mesh(new THREE.BoxGeometry(BW,.06,.95),woodM);pk.position.set(0,y,z0+.5);pk.castShadow=true;pk.receiveShadow=true;scaf.add(pk)}
 const net=new THREE.Mesh(new THREE.PlaneGeometry(BW*.5,H),new THREE.MeshStandardMaterial({color:0x2f6f5a,alphaMap:meshTex,transparent:true,opacity:.75,side:THREE.DoubleSide,roughness:.9}));net.material.alphaMap.repeat.set(BW*2,H*4);net.position.set(BW/4,H/2,z0+1.05);}
/* crane */
const crane=new THREE.Group();crane.position.set(-16,0,-9);S.add(crane);const MH=34,MW=1.6;
{const L=[],h=MW/2;for(let y=0;y<MH;y+=MW){const c=[[-h,-h],[h,-h],[h,h],[-h,h]];for(let i=0;i<4;i++){const a=c[i],b=c[(i+1)%4];L.push([V(a[0],y,a[1]),V(a[0],y+MW,a[1])],[V(a[0],y,a[1]),V(b[0],y,b[1])],[V(a[0],y,a[1]),V(b[0],y+MW,b[1])])}}crane.add(bars(L,.06,craneM,6))
 const base=new THREE.Mesh(new THREE.BoxGeometry(5,1.2,5),concM);base.position.y=.6;base.castShadow=base.receiveShadow=true;crane.add(base)}
const slew=new THREE.Group();slew.position.y=MH;crane.add(slew);
{const L=[],w=.7;for(let x=-1;x<38;x+=1.4){L.push([V(-x,0,-w),V(-x-1.4,0,-w)],[V(-x,0,w),V(-x-1.4,0,w)],[V(-x,1.2,0),V(-x-1.4,1.2*(1-(x+1.4)/42),0)],[V(-x,0,-w),V(-x-.7,1.2*(1-x/42),0)],[V(-x,0,w),V(-x-.7,1.2*(1-x/42),0)])}for(let x=0;x<12;x+=1.4)L.push([V(x,0,-w),V(x+1.4,0,-w)],[V(x,0,w),V(x+1.4,0,w)]);slew.add(bars(L,.05,craneM,5));
 const ap=bars([[V(-.6,0,-.6),V(0,7,0)],[V(.6,0,-.6),V(0,7,0)],[V(-.6,0,.6),V(0,7,0)],[V(.6,0,.6),V(0,7,0)]],.09,craneM,6);slew.add(ap);
 slew.add(bars([[V(0,7,0),V(-26,0.9,0)],[V(0,7,0),V(12,0,0)]],.025,steelM,4));
 const cw=new THREE.Mesh(new THREE.BoxGeometry(3,2.4,2),concM);cw.position.set(10.5,-1,0);cw.castShadow=true;slew.add(cw);
 const cab=new THREE.Mesh(new THREE.BoxGeometry(1.8,1.8,1.6),whiteM);cab.position.set(1.6,-.6,1.4);cab.castShadow=true;slew.add(cab);
 const cg=new THREE.Mesh(new THREE.BoxGeometry(.05,1.2,1.4),glassM);cg.position.set(2.52,-.5,1.4);slew.add(cg)}
const trolley=new THREE.Group();slew.add(trolley);const tb=new THREE.Mesh(new THREE.BoxGeometry(1.2,.5,1.4),steelM);trolley.add(tb);
const cableG=new THREE.BufferGeometry().setFromPoints([V(0,0,0),V(0,-10,0)]);const cable=new THREE.Line(cableG,new THREE.LineBasicMaterial({color:0x222222}));trolley.add(cable);
const hook=new THREE.Group();trolley.add(hook);{const bundle=bars([0,1,2,3,4].map(i=>[V(-3,0,(i-2)*.08),V(3,0,(i-2)*.08)]),.03,rebarM,5);hook.add(bundle);const sl=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([V(-2.5,0,0),V(0,1.6,0),V(2.5,0,0),V(0,1.6,0)]),new THREE.LineBasicMaterial({color:0x333333}));hook.add(sl)}
/* fence */
{const L=[],z=27;for(let x=-34;x<=34;x+=3.5){if(x>8&&x<16)continue;L.push([V(x,0,z),V(x,2,z)])}const fence=bars(L,.03,galvM,5);S.add(fence);
 const fm=new THREE.MeshStandardMaterial({color:0xd5d9dd,metalness:.7,roughness:.4,alphaMap:meshTex,transparent:true,side:THREE.DoubleSide,alphaTest:.3});fm.alphaMap=meshTex.clone();fm.alphaMap.repeat.set(30,4);fm.alphaMap.needsUpdate=true;
 for(const [a,b] of [[-34,8],[16,34]]){const p=new THREE.Mesh(new THREE.PlaneGeometry(b-a,1.9),fm);p.position.set((a+b)/2,1,z);S.add(p)}
 const ban=new THREE.Mesh(new THREE.PlaneGeometry(10,1.2),new THREE.MeshStandardMaterial({map:tex(1024,128,(x,w,h)=>{x.fillStyle="#16181B";x.fillRect(0,0,w,h);x.fillStyle="#E8732F";x.fillRect(20,28,72,72);x.fillStyle="#16181B";x.fillRect(38,46,36,36);x.fillStyle="#F6F5F1";x.font="600 52px DM Sans, Arial";x.fillText("Résidence Les Acacias · WEBIT BTP",120,82)}),roughness:.7}));ban.position.set(-12,1.25,27.05);S.add(ban)}
/* site huts */
for(let i=0;i<3;i++){const hut=new THREE.Group();hut.position.set(22,i===2?2.6:0,-6+(i%2)*3.2);S.add(hut);const b=new THREE.Mesh(new THREE.BoxGeometry(6,2.6,2.6),whiteM);b.position.y=1.3;b.castShadow=b.receiveShadow=true;hut.add(b);const st=new THREE.Mesh(new THREE.BoxGeometry(6.02,.3,2.62),new THREE.MeshStandardMaterial({color:0xc2410c,roughness:.6}));st.position.y=2.3;hut.add(st);const w=new THREE.Mesh(new THREE.PlaneGeometry(1.4,.9),glassM);w.position.set(1.4,1.5,1.31);hut.add(w)}
/* materials on site */
for(let i=0;i<6;i++){const p=new THREE.Mesh(new THREE.BoxGeometry(1.2,.9,1),new THREE.MeshStandardMaterial({color:0xb3523a,roughness:.9}));p.position.set(12+(i%3)*1.4,.45+Math.floor(i/3)*.92,14);p.castShadow=p.receiveShadow=true;S.add(p)}
S.add(bars([0,1,2,3,4,5,6,7].map(i=>[V(-6,.15+(i%2)*.1,16+i*.12),V(6,.15+(i%2)*.1,16+i*.12)]),.04,rebarM,5));
/* trees */
{const bg=new THREE.IcosahedronGeometry(1,1),trg=new THREE.CylinderGeometry(.18,.3,1,6);const greens=[0x3e5230,0x4a5f36,0x55693c,0x34472a].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:1}));const trm=new THREE.MeshStandardMaterial({color:0x4b3a2a,roughness:1});
 const N=110,parts=greens.map(m=>new THREE.InstancedMesh(bg,m,N*2)),cnt=[0,0,0,0],tr=new THREE.InstancedMesh(trg,trm,N);const e=new THREE.Euler();
 for(let i=0;i<N;i++){const a=rnd()*Math.PI*2,r=62+rnd()*150,x=Math.cos(a)*r,z=Math.sin(a)*r;if(z>28&&z<42)continue;const s=1.4+rnd()*1.6,hT=3+rnd()*2;tmpM.compose(V(x,hT*s/2,z),q.identity(),sc.set(s,hT*s,s));tr.setMatrixAt(i,tmpM);
  for(let k=0;k<8;k++){const gi=(i+k)%4;if(cnt[gi]>=N*2)continue;const r2=s*(1.4+rnd()*1.1);e.set(rnd()*3,rnd()*3,0);q.setFromEuler(e);tmpM.compose(V(x+(rnd()-.5)*s*2.4,hT*s+s*1.2+(rnd()-.2)*s*2.2,z+(rnd()-.5)*s*2.4),q,sc.set(r2,r2*.9,r2));parts[gi].setMatrixAt(cnt[gi]++,tmpM)}}
 parts.forEach((p,i)=>{p.count=cnt[i];p.castShadow=true;S.add(p)});S.add(tr)}
/* progress */
let prog=.62;const pctEl=document.getElementById("rprog"),pctV=document.getElementById("rpv");
function apply(){const built=prog*FL/.8;const n=Math.min(FL,Math.floor(built));floors.forEach((f,i)=>{f.visible=i<Math.max(1,Math.ceil(built));f.userData.fac.visible=prog>.8&&i<Math.round((prog-.8)/.2*FL+.5)});
 const done=prog>=.8;kit.visible=!done;kit.position.y=Math.min(FL-1,n)*FH+FH;roof.visible=prog>=.98;buildScaf(Math.max(1,Math.min(FL,Math.ceil(built))));scaf.visible=prog<.97;crane.visible=prog<.95;
 if(pctV)pctV.textContent=prog>=.99?"Livré":Math.round(prog*100)+" %"}
if(pctEl){pctEl.value=Math.round(prog*100);pctEl.addEventListener("input",()=>{prog=pctEl.value/100;apply()})}
apply();
let tod=.15;const todEl=document.getElementById("rtod");setTime(tod);if(todEl)todEl.addEventListener("input",()=>{tod=todEl.value/100;setTime(tod)});
/* hotspots */
const hs=[...stage.querySelectorAll(".hs")];const HP={rap:()=>V(0,kit.visible?kit.position.y+1.8:FL*FH+1,0),pho:()=>V(BW/4,8,BD/2+3.4),liv:()=>V(0,1.2,16),res:()=>V(-BW/2,2,BD/2+.6)};
const VIEWS={rap:[V(20,26,24),V(0,FL*FH*.7,0)],pho:[V(14,9,30),V(BW/4,7,BD/2)],liv:[V(-8,4,34),V(0,1,16)],res:[V(-24,4,22),V(-BW/2,2,BD/2)]};
let fly=null;const card=document.getElementById("rcard");
hs.forEach(h=>h.addEventListener("click",()=>{const k=h.dataset.k;hs.forEach(x=>x.classList.toggle("on",x===h));ctl.autoRotate=false;const vw=VIEWS[k];fly={p0:cam.position.clone(),t0:ctl.target.clone(),p1:vw[0],t1:vw[1],t:0};if(card){card.innerHTML=h.dataset.card;card.classList.add("on")}}));
if(card)card.addEventListener("click",()=>card.classList.remove("on"));
const v3=new THREE.Vector3();function place(){const w=cv.clientWidth,h=cv.clientHeight;hs.forEach(el=>{v3.copy(HP[el.dataset.k]()).project(cam);const vis=v3.z<1&&Math.abs(v3.x)<1&&Math.abs(v3.y)<1;el.style.transform=`translate(${(v3.x*.5+.5)*w|0}px,${(-v3.y*.5+.5)*h|0}px) translate(-50%,-50%)`;el.style.opacity=vis?1:0})}
function size(){const w=cv.clientWidth,h=cv.clientHeight;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}new ResizeObserver(size).observe(cv);size();
let vis=false;new IntersectionObserver(e=>{vis=e[0].isIntersecting;if(vis)loop()},{threshold:.02}).observe(stage);
const clk=new THREE.Clock();let running=false;
function loop(){if(running)return;running=true;requestAnimationFrame(frame)}
function frame(){if(!vis){running=false;return}const dt=Math.min(.05,clk.getDelta()),t=clk.elapsedTime;
 if(fly){fly.t=Math.min(1,fly.t+dt*.55);const e=1-Math.pow(1-fly.t,3);cam.position.lerpVectors(fly.p0,fly.p1,e);ctl.target.lerpVectors(fly.t0,fly.t1,e);if(fly.t>=1)fly=null}
 if(!reduce){slew.rotation.y=-.6+Math.sin(t*.12)*.7;trolley.position.x=-10-(Math.sin(t*.22)+1)*7;const d=8+(Math.sin(t*.3)+1)*6;cable.geometry.attributes.position.setY(1,-d);cable.geometry.attributes.position.needsUpdate=true;hook.position.y=-d-.1;hook.rotation.y=Math.sin(t*.4)*.3}
 ctl.update();R.render(S,cam);place();requestAnimationFrame(frame)}
window.__terrainReady=true;
}
