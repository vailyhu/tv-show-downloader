export const parseReleaseName = (releaseName) => {
    const matches = releaseName.match(/(.*)[. _](?:S([0-9]+).?E([0-9]+)(?:[E-]([0-9]+))?|([0-9])+x([0-9]+)(?:-([0-9]+))?)(.*?)-([^. ]+)(\.[a-z]+)?$/);
    return matches === null
        ? false
        : {
            name: matches[1].replace(/[._]/g, ' '),
            season: parseInt(matches[2] || matches[5], 10),
            episode: parseInt(matches[3] || matches[6], 10),
            doubleEpisode: !!(matches[4] || matches[7]),
            releaseData: matches[8],
            releaseGroup: matches[9]
        };
};

export const isTheSameEpisode = (epData1, epData2) => (
    epData1.name === epData2.name &&
    epData1.season === epData2.season &&
    epData1.episode === epData2.episode
);
