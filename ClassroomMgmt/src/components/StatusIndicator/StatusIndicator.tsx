import React from 'react';
import { translateCourseStatus } from '../../helpers/data.helpers';
import "./StatusIndicator.scss";

interface StatusIndicatorProps {
    status: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {

    return (
        <span className={`status-indicator${status ? ` ${status.toLowerCase()}` : ''}`}>{translateCourseStatus(status)}</span>
    )
}

export default StatusIndicator;