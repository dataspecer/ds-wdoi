import bz2 

with bz2.BZ2File("./classes.json.bz2") as f:
    for line in f:
        print(line.decode().strip()[0:30])
        
        