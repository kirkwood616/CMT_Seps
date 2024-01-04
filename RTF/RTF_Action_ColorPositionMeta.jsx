function RTF_Action_ColorPositionMeta() {
  // @include "RTF_Ungroup_TransferArt.jsx"
  // @include "RTF_OverprintFill_False.jsx"
  // @include "RTF_Trim_TransferArt.jsx"
  // @include "RTF_Ungroup_TransferArt.jsx"
  // @include "RTF_Delete_NoColorPaths.jsx"
  // @include "RTF_OverPrintFill_True.jsx"
  // @include "RTF_Group_TransferArtColors.jsx"
  // @include "RTF_PositionMesh.jsx"
  // @include "RTF_Sort_GroupPosition.jsx"
  // @include "RTF_Unite_LastColor.jsx"
  // @include "RTF_Generate_Metadata_Color.jsx"
  // @include "RTF_Generate_Metadata_Count.jsx"
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "RTF_Template") {
    RTF_Action_ColorPositionMeta();
  } else {
    throw new Error("RTF Template File Not Active");
  }
} catch (e) {
  alert(e, "Script Alert", true);
}
