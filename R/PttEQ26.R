rm(list=ls(all.names=TRUE))
library(XML)
library(RCurl)
library(httr)
Sys.setlocale(category = "LC_ALL", locale="cht")

subpathURL="https://www.ptt.cc/bbs/EarthQuake26/index"
startNo = 1
endNo = 16
alltitle=data.frame()

for(i in c(startNo:endNo))
{
  pathURL=paste(subpathURL, i, ".html", sep="")
  print(pathURL)
  tempDATA = getURL(pathURL, encoding="big5" )
  xmldoc = htmlParse(tempDATA)
  title = xpathApply(xmldoc, "//div[@class=\"title\"]", xmlValue)
  title = gsub("\n", "", title)
  title = gsub("\t", "", title)
  author = xpathApply(xmldoc, "//div[@class=\"author\"]", xmlValue)
  url = xpathApply(xmldoc, "//div[@class=\"title\"]/a//@href")
  date = xpathApply(xmldoc, "//div[@class=\"date\"]", xmlValue)
  result = tryCatch({
    alltitle = rbind(alltitle, data.frame(title))
    print(url)
  }, error= function(err){
    print(url)
  })
}
write.table(alltitle, file="PttEQ26.csv")
