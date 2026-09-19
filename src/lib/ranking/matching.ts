export function cleanTitle(value:string) {return value.replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ');}
export const normalize=(v:string)=>cleanTitle(v).normalize('NFKC').toLocaleLowerCase().replace(/[\s\p{P}\p{S}]/gu,'');
export function matches(name:string,address:string,item:{title:string;address:string;roadAddress:string}) {return normalize(name)===normalize(item.title) && [item.address,item.roadAddress].some(a=>Boolean(a)&&normalize(a)===normalize(address));}
