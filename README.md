# Installation

1. Click green `<> Code` button in the upper right and select `Download ZIP`

2. Unzip the `CMT_Seps-main.zip` file, preferably to Desktop.

3. Navigate to the Illustrator Scripts folder, `/Adobe Illustrator (Version)/Presets/en_US/Scripts`

4. Open unzipped folder titled `CMT_Seps-main`

5. Copy or move the `CMT_SCRIPTS` folder to Illustrator's Scripts folder `... > Presets > en_US > Scripts`

> [!IMPORTANT]
> If the `CMT_SCRIPTS` folder is already present in Illustrator's `Scripts` folder, delete or replace it with the new version.
> If replacing a previous version where all folders (AF, CSETTINGS, NTF, RTF, SP) were directly located in Illustrator's `Scripts` folder, delete all these folders and replace with `CMT_SCRIPTS` folder.

6. If Illustrator is currently running, Quit the application and relaunch for the scripts to be accessible.

7. When Illustrator has been relaunched, open the `Actions` window, click the 3 lines in the upper right corner and click `Load Actions`

8. Load actions from `CMT_Seps-main/actions/CMT_Seps_ACTIONS.ait`

> [!TIP]
> It is recommended to select `Button Mode` for ease of use.

9. Before using these actions, you will need to open any Illustrator file, and run the first action `»» CMT SEPS SETTINGS ««` to define the paths to the templates and save folders.

10. All `TEMPLATE FILE PATH` are defaulted to `Desktop/CMT_Seps-main/templates/(Template Name)`. If you have placed the unzipped `CMT_Seps-main` folder anywhere other than `Desktop`, you will need to update the file path to wherever the folder is located and to the respective template located in the `CMT_Seps-main/templates` folder.

    - `SP TEMPLATE FILE PATH` = `SP_Template.ait`
    - `SP PROOF TEMPLATE FILE PATH` = `PAGE_PROOF.ait`
    - `NTF TEMPLATE FILE PATH` = `NTF_Template.ait`
    - `NTF PROOF TEMPLATE FILE PATH` = `NTF_Cut_Proof.ait`
    - `RTF TEMPLATE FILE PATH` = `RTF_Template.ait`

11. All `SAVE FOLDER PATH` and `SAVE PATH` are defaulted to `Desktop/- WORKING DAY -`. Either create a folder on your Desktop titled `- WORKING DAY -`, or select a folder where you would like the files saved to.

12. In the `MESH` tab there is a list of all standard mesh counts. These will appear in a list for scripts that prompt for Mesh Count selection. Uncheck any mesh counts you do not want to appear in the mesh selection lists.

13. Click `SAVE` button at the bottom to save your settings.

> [!WARNING]
> If you receive any errors when trying to open templates or save files via these actions, your file paths are not set correctly. Re-run the settings action and confirm your file and folder paths are set correctly.

> [!CAUTION]
> The Settings feature will create a folder named `CMT_Seps_Settings` in your `Documents` folder. DO NOT DELETE OR MODIFY THIS FOLDER OR IT'S CONTENTS.

14. Finally, with an Illustrator document open, in the actions panel you will need to run `»» COLOR LIBRARY IMPORT ««`. You will see an alert with the message "Color Library Settings Successful!". You are now ready to proceed with using the actions & scripts.
