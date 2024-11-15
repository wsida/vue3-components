declare const textStyles: string[];
declare const scalableStyles: string[];
declare const layoutAffectedStyles: string[];
declare const getDefaultStyle: () => {
    left: undefined;
    top: undefined;
    right: undefined;
    bottom: undefined;
    width: undefined;
    height: undefined;
    maxWidth: undefined;
    maxHeight: undefined;
    minWidth: undefined;
    minHeight: undefined;
    margin: undefined;
    marginLeft: undefined;
    marginRight: undefined;
    marginTop: undefined;
    marginBottom: undefined;
    padding: undefined;
    paddingLeft: undefined;
    paddingRight: undefined;
    paddingTop: undefined;
    paddingBottom: undefined;
    borderWidth: undefined;
    flexDirection: undefined;
    justifyContent: undefined;
    alignItems: undefined;
    alignSelf: undefined;
    flex: undefined;
    flexWrap: undefined;
    position: undefined;
    hidden: boolean;
    scale: number;
};
export { getDefaultStyle, scalableStyles, textStyles, layoutAffectedStyles };
