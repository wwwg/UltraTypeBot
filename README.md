# UltraType Bot
![UltraType Logo](https://github.com/ultratype/UltraTypeBot/raw/master/ico/logo.png)
<br>
[Quick Tampermonkey install](https://github.com/ultratype/UltraTypeBot/raw/master/UltraType.user.js)

UltraType is a fast, easy to use bot for NitroType.com. UltraType provides unique features that no other bot has implemented, such as customizable WPM and accuracy.

# How do I install UltraType?

#### Installing on Tampermonkey (the easy way)
To install UltraType on Tampermonkey, [install Tampermonkey from the Chrome Webstore](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) if you haven't yet. After Tampermonkey has been installed, [click here to install UltraType](https://github.com/ultratype/UltraTypeBot/raw/master/UltraType.user.js).
#### Installing as an unpacked extension (the slightly more difficult way)
If you are a developer, or Tampermonkey isn't working properly for you, installation can be done by loading the unpacked Chrome extension. Follow these steps to install the unpacked extension:
- In the top right of this page, click the "Clone or download" button, then click "Download ZIP"
- After the download has finished, open the options menu by clicking the icon in the top right of your Chrome window, then go to More tools -> Extensions.
- Check the "Developer Mode" check box in the top right of the page.
- Click the "Load unpacked extension" button in the top left, and then select the ZIP you downloaded from the file selector.
- Installation is finished! Visit https://www.nitrotype.com/race/ to try it out.

# How does it work?
UltraType hooks native JavaScript functions and methods to gather information about the current race session. The extension captures the lesson text by processing every characer that is rendered onto the game canvas, and uses the coordinates the text was rendered at to adjust the string accordingly. UltraType automatically detects the user's average WPM and accuracy by parsing API requests made to NitroType. There is much more to UltraType that goes on behind the scenes, which can be read in [OUT.js](https://github.com/ultratype/UltraTypeBot/blob/master/OUT/OUT.js).

#### Disclaimer
NitroType.com is a registered trademark owned by learning.com, and associates. UltraType is not related to, nor does it claim to be apart of said trademark.
