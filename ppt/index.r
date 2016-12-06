rm(list=ls(all=TRUE))
library(readr)

require(devtools)

library(rCharts)

dataSET <- iris
names(dataSET) <- gsub("\\.","", names(dataSET))
iriplot <- rPlot(SepalLength ~ SepalWidth | Species, 
      data = dataSET, color = "Species", type = "point")

iriplot$save("iriplot.html",standalone = TRUE)