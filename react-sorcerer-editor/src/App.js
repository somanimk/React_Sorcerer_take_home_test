import React from 'react';
import Title from './components/Title';
import SaveButton from './components/SaveButton';
import EditorComponent from './components/EditorComponent';
import './App.css';

function App() {
  const editorRef = React.useRef(null);

  const handleSave = () => {
    if (editorRef.current) {
      editorRef.current.saveContent(); // Call the save function from EditorComponent
    }
  };

  return (
    <div className="App">
      <Title />
      <SaveButton onSave={handleSave} />
      <EditorComponent ref={editorRef} />
    </div>
  );
}

export default App;
