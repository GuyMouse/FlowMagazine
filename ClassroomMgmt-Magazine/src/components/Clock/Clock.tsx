
import React, { useEffect, useState } from "react";
import "./Clock.scss";
import { ReactComponent as ClockIcon } from "../../assets/icons/clock.svg"
import ReactDOM from 'react-dom';



const Clock: React.FC = () => {



    const [timeInSeconds, updatetime] = useState(3600);
    useEffect(() => {

        const secondsinterval = setInterval(() => {
            updatetime(prevCount => {
                if(prevCount<=0){
                    return 0;}
                return prevCount-1;    
                });
        },1000);

        return () => {
            clearInterval(secondsinterval);
        };
    }, []);

    let minutes=Math.floor((timeInSeconds/60)%60);
    let seconds=Math.floor(timeInSeconds%60);
    let houer=Math.floor(timeInSeconds/3600);
    //<ProgressBar ></ProgressBar>
    return (
        <div className="clock">

            <div className="progress-container">
                <svg className="progress-bar">
                    <circle className="circle"
                        cx="77.5"
                        cy="77.5"
                        r="70"
                        stroke-dashoffset={440*(1-timeInSeconds/3600)}
                    />
                </svg>
                <div className="details-container">

                    <div className="icon-container">
                        <ClockIcon className="clockicon"></ClockIcon>
                        <span className="icon-text">נשארו</span>
                    </div>

                    <div className="alarm-clock">
                        <span>{houer.toString().padStart(2,'0')}:{minutes.toString().padStart(2,'0')}:{seconds.toString().padStart(2,'0')}</span>
                    </div>
                    <div className="text-container">
                        <span> שניות</span>
                        <span> דקות</span>
                        <span> שעות</span>
                    </div>
                </div>


            </div>
        </div>



    );



};

export default Clock;