import React from 'react';
import {
    Delete, Edit, Visibility, Cancel,
    Block, CheckCircle
} from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import toast from 'react-hot-toast';

const ActionButtons = ({ status, item, handlers = {} }) => {
    // console.log("status", status);
    /* ----- 1. actions that are NOT view‑only -------------------------- */
    const baseStatusActions = {
        invited: [
            { icon: Cancel, label: 'Cancel', key: 'cancel', color: '#F87168' },
            { icon: Edit, label: 'Edit', key: 'edit', color: '#FFA500' },
            { icon: Visibility, label: 'View', key: 'view', color: '#579DFF' },
        ],
        requested: [
            { icon: Edit, label: 'Edit', key: 'edit', color: '#FFA500' },
            { icon: Visibility, label: 'View', key: 'view', color: '#579DFF' },
            { icon: Cancel, label: 'Reject', key: 'reject', color: '#FF4C4C' },
            { icon: CheckCircle, label: 'Accept', key: 'accept', color: '#4BCE97' },
        ],
        trial: [
            { icon: Edit, label: 'Edit', key: 'edit', color: '#FFA500' },
            { icon: Visibility, label: 'View', key: 'view', color: '#579DFF' },
            { icon: Cancel, label: 'Cancel', key: 'cancel', color: '#F87168' },
        ],
        active: [
            { icon: Visibility, label: 'View', key: 'view', color: '#579DFF' },
            { icon: Edit, label: 'Edit', key: 'edit', color: '#FFA500' },
            { icon: Block, label: 'Inactive', key: 'inactivate', color: '#A1AEC2' },
        ],
        inactive: [
            { icon: Visibility, label: 'View', key: 'view', color: '#579DFF' },
            { icon: Edit, label: 'Edit', key: 'edit', color: '#FFA500' },
            { icon: CheckCircle, label: 'Activate', key: 'activate', color: '#4BCE97' },
        ],
        paid: [
            { icon: Visibility, label: 'View', key: 'view', color: '#579DFF' },
            { icon: Edit, label: 'Edit', key: 'edit', color: '#FFA500' },
            // { icon: CheckCircle, label: 'Activate', key: 'activate', color: '#4BCE97' },
        ],
        overdue: [
            { icon: Cancel, label: 'Cancel', key: 'cancel', color: '#F87168' },
            { icon: Edit, label: 'Edit', key: 'edit', color: '#FFA500' },
            { icon: Visibility, label: 'View', key: 'view', color: '#579DFF' },
        ],
        processing: [
            { icon: Cancel, label: 'Cancel', key: 'cancel', color: '#F87168' },
            { icon: Edit, label: 'Edit', key: 'edit', color: '#FFA500' },
            { icon: Visibility, label: 'View', key: 'view', color: '#579DFF' },
        ],
        pending: [
            { icon: Edit, label: 'Edit', key: 'edit', color: '#FFA500' },
            { icon: Visibility, label: 'View', key: 'view', color: '#579DFF' },
            { icon: Delete, label: 'Delete', key: 'delete', color: '#FC0F03' },
        ],
        error: [
            { icon: Delete, label: 'Delete', key: 'delete', color: '#FC0F03' },
        ],
        approved: [
            { icon: Visibility, label: 'View', key: 'view', color: '#579DFF' },
            { icon: Edit, label: 'Edit', key: 'edit', color: '#FFA500' },
        ],
    };

    /* ----- 2. statuses that should get ONLY a “View” action ----------- */
    const viewOnlyStatuses = [
        'present', 'early out', 'half leave', 'leave', 'absent', 'late arrival',
        'assigned', 'ongoing', 'completed', 'delayed', 'pause'
    ];

    const viewAction = {                             // single shared view action
        icon: Visibility, label: 'View', key: 'view', color: '#579DFF'
    };

    /* ----- 3. merge base + generated view‑only map -------------------- */
    const statusActionsMap = {
        ...baseStatusActions,
        ...Object.fromEntries(viewOnlyStatuses.map(st => [st, [viewAction]]))
    };

    /* ----- 4. render -------------------------------------------------- */
    const actions = statusActionsMap[status] || [];

    const handleClick = key =>
        handlers[key]
            ? handlers[key](item)
            :toast.error(`Handler for "${key}" not implemented.`);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            {actions.map(({ icon: Icon, label, key, color }) => (
                <Tooltip key={key} title={label} arrow>
                    <div
                        onClick={() => handleClick(key)}
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color }}
                    >
                        <Icon fontSize="small" />
                    </div>
                </Tooltip>
            ))}
        </div>
    );
};

export default ActionButtons;
