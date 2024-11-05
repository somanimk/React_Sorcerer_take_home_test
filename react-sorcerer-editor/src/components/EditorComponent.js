import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Editor, EditorState, RichUtils, Modifier, convertToRaw, convertFromRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';
import './EditorComponent.css';

const styleMap = {
  BOLD: {
    fontWeight: 'bold',
  },
  RED: {
    color: 'red',
  },
  UNDERLINE: {
    textDecoration: 'underline',
  },
};

const EditorComponent = forwardRef((props, ref) => {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

  useEffect(() => {
    const savedContent = localStorage.getItem('content');
    if (savedContent) {
      const contentState = convertFromRaw(JSON.parse(savedContent));
      setEditorState(EditorState.createWithContent(contentState));
    }
  }, []);

  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const onChange = (state) => {
    setEditorState(state);
  };

  const handleBeforeInput = (chars) => {
    const currentContent = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const blockKey = selection.getStartKey();
    const block = currentContent.getBlockForKey(blockKey);
    const blockText = block.getText();

    if (blockText === '#' && chars === ' ') {
      const updatedContent = Modifier.replaceText(
        currentContent,
        selection.merge({
          anchorOffset: 0,
          focusOffset: blockText.length,
        }),
        '' // Remove `# ` from the beginning
      );
      const newEditorState = EditorState.push(editorState, updatedContent, 'change-inline-style');
      setEditorState(RichUtils.toggleBlockType(newEditorState, 'header-one'));
      return 'handled';
    } else if (blockText === '*' && chars === ' ') {
      const updatedContent = Modifier.replaceText(
        currentContent,
        selection.merge({
          anchorOffset: 0,
          focusOffset: blockText.length,
        }),
        '' // Remove `* ` from the beginning
      );
      const newEditorState = EditorState.push(editorState, updatedContent, 'change-inline-style');
      setEditorState(RichUtils.toggleInlineStyle(newEditorState, 'BOLD'));
      return 'handled';
    } else if (blockText === '**' && chars === ' ') {
      const updatedContent = Modifier.replaceText(
        currentContent,
        selection.merge({
          anchorOffset: 0,
          focusOffset: blockText.length,
        }),
        '' // Remove `** ` from the beginning
      );
      const newEditorState = EditorState.push(editorState, updatedContent, 'change-inline-style');
      setEditorState(RichUtils.toggleInlineStyle(newEditorState, 'RED'));
      return 'handled';
    } else if (blockText === '***' && chars === ' ') {
      const updatedContent = Modifier.replaceText(
        currentContent,
        selection.merge({
          anchorOffset: 0,
          focusOffset: blockText.length,
        }),
        '' // Remove `*** ` from the beginning
      );
      let newEditorState = EditorState.push(editorState, updatedContent, 'change-inline-style');

      // Remove `RED` style if it's already applied to prevent red underline
      newEditorState = RichUtils.toggleInlineStyle(newEditorState, 'RED');
      setEditorState(RichUtils.toggleInlineStyle(newEditorState, 'UNDERLINE'));
      return 'handled';
    }
    return 'not-handled';
  };

  const handleReturn = (e) => {
    const currentContent = editorState.getCurrentContent();
    const selection = editorState.getSelection();

    // Split the block to create a new line
    const newContentState = Modifier.splitBlock(currentContent, selection);
    let newEditorState = EditorState.push(editorState, newContentState, 'split-block');

    // Reset inline styles for the new line
    const currentStyle = newEditorState.getCurrentInlineStyle();
    currentStyle.forEach((style) => {
      newEditorState = RichUtils.toggleInlineStyle(newEditorState, style);
    });

    setEditorState(newEditorState);
    return 'handled';
  };

  useImperativeHandle(ref, () => ({
    saveContent() {
      const content = editorState.getCurrentContent();
      const rawContent = JSON.stringify(convertToRaw(content));
      localStorage.setItem('content', rawContent);
      alert('Content saved!');
    },
  }));

  return (
    <div className="editor-container">
      <Editor
        editorState={editorState}
        handleKeyCommand={handleKeyCommand}
        onChange={onChange}
        placeholder="Type # for heading, * for bold, ** for red, *** for underline"
        handleBeforeInput={handleBeforeInput}
        handleReturn={handleReturn}
        customStyleMap={styleMap} 
      />
    </div>
  );
});

export default EditorComponent;
