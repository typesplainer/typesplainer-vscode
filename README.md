<div align="center">
<img src="https://i.imgur.com/5IFkzIf.png" width="128px">
<h1>Typesplainer for vscode</h1>
 A Python typehint explainer!

Available [as a vscode extension](https://marketplace.visualstudio.com/items?itemName=WasiMaster.typesplainer), [as a cli](https://pypi.org/project/typesplainer), [as a website](https://typesplainer.herokuapp.com),

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/WasiMaster.typesplainer?label=vscode)](https://marketplace.visualstudio.com/items?itemName=WasiMaster.typesplainer) [![Website](https://img.shields.io/website?url=https%3A%2F%2Ftypesplainer.herokuapp.com)](https://typesplainer.herokuapp.com) [![PyPI](https://img.shields.io/pypi/v/typesplainer?label=cli)](https://pypi.org/project/typesplainer)
</div>

> ⚠️ NOTE: Make sure you have the typesplainer package installed with python 3.6+

## Usage

Make sure you have python 3.6+ and have the package `typesplainer` installed (`pip install typesplainer`). And then make sure the python command is available to the extension. The order in which the extension searches for python path is given below:

1. The setting `typesplainer.pythonPath`
2. The setting `python.pythonPath`
3. The setting `python.defaultInterpreterPath`
4. The environment variable `PYTHONPATH`

To make sure the extension detects the correct python executable with typesplainer installed, make sure those settings are set accordingly.

If all goes well, you should be able to hover over some type and the extension should show you the type explanation. If it shows outdated typehint explanation, try clearing the cache using the clear cache command. If anything goes wrong, make sure to open a issue on the GitHub repository.
