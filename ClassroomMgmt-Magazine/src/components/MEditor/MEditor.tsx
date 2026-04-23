import React, { useState } from "react";
import "./MEditor.scss";
import { EditorState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';


interface MEditorProps {

    state: EditorState;
    onChange: (state: EditorState) => void;

}
const uploadImageCallBack = (file: any) => {
    return new Promise(
        (resolve, reject) => {

            const tempLink = URL.createObjectURL(file);
            resolve({ data: { link: tempLink } });
        }
    );
}
const toolbarConfig = {
    options: [/* 'inline', */ 'fontSize', 'colorPicker',/*  'fontFamily', */ 'list', /* 'textAlign', */ /* 'link', */ 'image', 'remove',/*  'history' */],
    inline: { options: ['bold', 'italic', 'underline'] },
    fontSize: {
        options: [12, 14, 16, 18, 24, 30, 36],
    },
    fontFamily: {
        /*  options: ['Noto Sans', 'Arial', 'Georgia', 'Impact', 'Tahoma', 'Times New Roman', 'Verdana'], */
        // className: undefined,
        // component: undefined,
        // dropdownClassName: undefined,
    },
    list: { options: ['unordered', 'ordered'] },
    image: { uploadEnabled: true, previewImage: true, uploadCallback: uploadImageCallBack }
};
const MEditor: React.FC<MEditorProps> = ({ state, onChange }) => {
    return (
        <Editor
            wrapperClassName="wrapper"
            toolbarClassName="tools-wrapper"
            toolbar={toolbarConfig}
            editorClassName="editor"
            editorState={state}
            onEditorStateChange={onChange}
        />
    )
}

export default MEditor;
