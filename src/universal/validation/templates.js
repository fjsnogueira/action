import {compositeIdRegex, emailRegex, idRegex, urlRegex} from 'universal/validation/regex';
import emailAddresses from 'email-addresses';
import {APP_MAX_AVATAR_FILE_SIZE} from 'universal/utils/constants';
import {PROJECT_MAX_CHARS} from 'universal/utils/constants';

export const avatar = {
  size: (value) => value
    .int('Hey! Don\'t monkey with that!')
    .test((raw) => {
      if (raw > APP_MAX_AVATAR_FILE_SIZE) {
        return `File too large! It must be <${APP_MAX_AVATAR_FILE_SIZE / 1024}kB`;
      }
      return undefined;
    }),
  type: (value) => value
    .matches(/image\/.+/, 'File must be an image')
};

export const compositeId = (value) => value.matches(compositeIdRegex);

export const fullName = (value) => value
  .trim()
  .min(1, 'It looks like you wanted to include a name')
  .max(PROJECT_MAX_CHARS, 'That name looks too long!');

export const inviteesRaw = (value) => value
  .test((raw) => {
    if (!raw) return undefined;
    const parsedAddresses = emailAddresses.parseAddressList(raw);
    if (!parsedAddresses) {
      let i = raw.lastIndexOf(',');
      while (i > 0) {
        const lastGoodString = raw.substr(0, i);
        const parseable = emailAddresses.parseAddressList(lastGoodString);
        if (parseable) {
          const startingIdx = lastGoodString.lastIndexOf(',') + 1;
          return `The email after ${lastGoodString.substr(startingIdx)} doesn't look quite right`;
        }
        i = lastGoodString.lastIndexOf(',');
      }
      return 'That first email doesn\'t look right';
    }
    return undefined;
  });

export const id = (value) => value.matches(idRegex);

export const requiredId = (value) => value.required().matches(idRegex);

export const requiredEmail = (value) => value
  .trim()
  .required('You should enter an email here')
  .matches(emailRegex, 'That doesn\'t look like an email address');

export const makeInviteeTemplate = (inviteEmails, teamMemberEmails, pendingApprovalEmails = []) => {
  return (value) => value
    .trim()
    .required('You should enter an email here')
    .matches(emailRegex, 'That doesn\'t look like an email address')
    .test((inviteTeamMember) => {
      return inviteEmails.includes(inviteTeamMember) && 'That person has already been invited!';
    })
    .test((inviteTeamMember) => teamMemberEmails.includes(inviteTeamMember) && 'That person is already on your team!')
    .test((inviteTeamMember) => pendingApprovalEmails.includes(inviteTeamMember) && 'That person is awaiting org approval');
};

export const orgName = (value) => value
  .trim()
  .required('Your new org needs a name!')
  .min(2, 'C\'mon, you call that an organization?')
  .max(100, 'Maybe just the legal name?');

export const orgRejectionReason = (value) => value
  .trim()
  .min(2, 'Maybe a couple more words?')
  .max(PROJECT_MAX_CHARS, 'That seems like a good enough reason');

export const preferredName = (value) => value
  .trim()
  .required('That\'s not much of a name, is it?')
  .min(2, 'C\'mon, you call that a name?')
  .max(100, 'I want your name, not your life story');

export const task = (value) => value
  .trim()
  .min(2, 'That doesn\'t seem like much of a task')
  .max(PROJECT_MAX_CHARS, 'Try shortening down the task name');

export const teamName = (value) => value
  .trim()
  .required('"The nameless wonder" is better than nothing')
  .min(2, 'The "A Team" had a longer name than that')
  .max(50, 'That isn\'t very memorable. Maybe shorten it up?');

export const url = (value) => value.matches(urlRegex);

