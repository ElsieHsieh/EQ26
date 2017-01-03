rm(list=ls(all=TRUE))
library(readr)

require(devtools)

library(rCharts)

dataSET <- iris
names(dataSET) <- gsub("\\.","", names(dataSET))
iriplot <- rPlot(SepalLength ~ SepalWidth | Species, 
      data = dataSET, color = "Species", type = "point")

iriplot$save("iriplot.html",standalone = TRUE)


#NFA1201 <- read_csv("D:/L_Coding/EQ26/R/NFA1201.csv")
#View(NFA1201)
#id<-seq(1,length(NFA1201$CASE_ID),14)
#dataOut <- NFA1201[id,]
#dataOut$