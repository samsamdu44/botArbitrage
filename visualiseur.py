import numpy as np
import matplotlib.pyplot as plt

# Pour visualiser

f = open("data.txt", "r")
tab = f.read()
f.close()
tab = [float(x) for x in tab.split(",")]

f = open("dataH.txt", "r")
tab2 = f.read()
f.close()
tab2 = [float(x)/1000 for x in tab2.split(",")]

plt.xlabel("Temps (s)")
plt.ylabel("Marge")

x = np.array(tab2)     # Données en abscisse
y = np.array(tab) # Données en ordonnée

plt.plot(x, y)       # Tracé de la courbe
plt.show()     