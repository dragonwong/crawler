# 加密关键代码

```js
var r = "//" + (o.prefix ? o.prefix + "." : "") + (o.subDomain ? o.subDomain + "." : "") + o.mainDomain + "/h5/" + n.api.toLowerCase() + "/" + n.v.toLowerCase() + "/"
                  , s = n.appKey || ("waptest" === o.subDomain ? "4272" : "12574478")
                  , a = (new Date).getTime()
                  , u = p(o.token + "&" + a + "&" + s + "&" + n.data)
                  , c = {
                    jsv: S,
                    appKey: s,
                    t: a,
                    sign: u
                }
token = f56ad5d9655a2377339e35b541a3c181
cookie = lid=anguswhile; cna=sxb9Ee9tCwoCAWq6H/6Rh9RN; OUTFOX_SEARCH_USER_ID_NCOO=833023715.5058905; dnk=anguswhile; uc1=cookie16=URm48syIJ1yk0MX2J7mAAEhTuw%3D%3D&cookie21=VT5L2FSpczFp&cookie15=VFC%2FuZ9ayeYq2g%3D%3D&existShop=false&pas=0&cookie14=UoTZ50l5mLcNDg%3D%3D&tag=8&lng=zh_CN; t=ac3651b7a18cfca9be1bc79ed6b236e3; tracknick=anguswhile; csg=8b137bc0; lgc=anguswhile; _tb_token_=eeb3b5d687e1e; sm4=110100; csa=0_0_0.0; l=bBQFxekeviomBRgKBOCNSZaECl7tAIRAguWbL5-Di_5pw6T_7-_OlUTZXF96Vj5ROxTe4c0qjjy9-etj9; _m_h5_tk=f56ad5d9655a2377339e35b541a3c181_1559638246646; _m_h5_tk_enc=630524a0712a2a7eb5a6e0bd289e67b3; ___rl__test__cookies=1559629016073; isg=BAQE9IKxBAGUDLfm7CqlVZ5S1YT8HDEEXb6Kwx6lkE-SSaQTRi34Fzr7jac06GDf


p(o.token + "&" + a + "&" + s + "&" + n.data)
```