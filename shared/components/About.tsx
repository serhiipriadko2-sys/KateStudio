// About.tsx
import React from 'react';
import { ABOUT_CONSTANTS } from '../constants';

const About: React.FC = () => {
    return (
        <section>
            <h2>{ABOUT_CONSTANTS.ABOUT_TITLE}</h2>
            <p>{ABOUT_CONSTANTS.ABOUT_DESCRIPTION}</p>
        </section>
    );
};

export default About;