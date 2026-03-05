import React, { useEffect, useState } from 'react';
import initialPoetryData from './data';

const App = () => {
    const [poems, setPoems] = useState(initialPoetryData);
    const [favorites, setFavorites] = useState([]);
    const [userPoetry, setUserPoetry] = useState([]);

    useEffect(() => {
        const storedFavorites = localStorage.getItem('favorites');
        const storedUserPoetry = localStorage.getItem('userPoetry');
        if (storedFavorites) {
            setFavorites(JSON.parse(storedFavorites));
        }
        if (storedUserPoetry) {
            setUserPoetry(JSON.parse(storedUserPoetry));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('favorites', JSON.stringify(favorites));
        localStorage.setItem('userPoetry', JSON.stringify(userPoetry));
    }, [favorites, userPoetry]);

    const addToFavorites = (poem) => {
        setFavorites((prev) => [...prev, poem]);
    };

    const addUserPoetry = (newPoem) => {
        setUserPoetry((prev) => [...prev, newPoem]);
    };

    return (
        <div>
            <h1>Poetry App</h1>
            <div>
                {poems.map((poem, index) => (
                    <div key={index}>
                        <h2>{poem.title}</h2>
                        <p>{poem.content}</p>
                        <button onClick={() => addToFavorites(poem)}>Favorite</button>
                    </div>
                ))}
            </div>
            <div>
                <h2>Your Poetry</h2>
                {userPoetry.map((poem, index) => (
                    <div key={index}>
                        <h2>{poem.title}</h2>
                        <p>{poem.content}</p>
                    </div>
                ))}
            </div>
            <button onClick={() => addUserPoetry({ title: 'My Poem', content: 'This is my poem.' })}>Add My Poetry</button>
        </div>
    );
};

export default App;