// Turn reminder data schema
{
    id: id string,                         // The 32 char (allegedly) unique ID for this reminder
    combat: id string,                     // The combat that this turn reminder belongs to
    round: integer,                        // The round that this turn reminder will activate on
    turn: id string | null,                // The turn that this reminder will activate on. If null, activates at the top of the round
    roundAbsolute: boolean,                // Whether the round number is absolute (i.e. the reminder happens on round 5) or relative to the round during which the reminder was created (i.e. the reminder happens 5 rounds after creation)
    repeating: boolean,                    // Whether this reminder will repeat. If this reminder triggers on an absolute round number (roundAbsolute is true), this is ignored!
    message: string,                       // The message to be displayed in chat when the reminder is activated
    recipients: [actor id strings] | null  // The actors to whom the message should be whispered. If null, the message is public
}