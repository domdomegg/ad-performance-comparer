{
    const getNums = (metric) => {
        const nodeList = document.querySelectorAll(`.ads-table__table tbody [data-live-test-reporting-cell="${metric}"]`)
        return [...nodeList].map(node => parseInt(node.innerText.replaceAll(',', '')))
    }

    const calculateStatisticalSignificance = (usersA, conversionsA, usersB, conversionsB) => {
        const conversionRateA = conversionsA / usersA;
        const conversionRateB = conversionsB / usersB;

        const pooledUsers = usersA + usersB;
        const pooledConversions = conversionsA + conversionsB;
        const pooledConversionRate = pooledConversions / pooledUsers;
        const standardError = Math.sqrt(
            pooledConversionRate * (1 - pooledConversionRate) * ((1 / usersA) + (1 / usersB))
        );

        const zScore = (conversionRateB - conversionRateA) / standardError;
        const pValue = 2 * (1 - normsdist(Math.abs(zScore)));

        return {
            conversionRateA,
            conversionRateB,
            zScore,
            pValue,
        };
    }

    // Helper function to calculate the cumulative distribution function of the standard normal distribution
    const normsdist = (z) => {
        const b1 = 0.319381530;
        const b2 = -0.356563782;
        const b3 = 1.781477937;
        const b4 = -1.821255978;
        const b5 = 1.330274429;
        const p = 0.2316419;
        const c2 = 0.3989423;

        const a = Math.abs(z);
        const t = 1 / (1 + a * p);
        const b = c2 * Math.exp((-z) * (z / 2));
        const n =
            ((((b5 * t + b4) * t + b3) * t + b2) * t + b1) * t;
        const cdf = z > 0 ? 1 - b * n : b * n;
        return cdf;
    }

    const outputResults = (type, indexes, users, conversions, adNames) => {
        const results = calculateStatisticalSignificance(
            users[indexes[0]],
            conversions[indexes[0]],
            users[indexes[1]],
            conversions[indexes[1]],
        );
    
        if (results.pValue < 0.05) {
            if (results.zScore < 0) {
                alert(`${type} p-value: ${results.pValue.toFixed(3)}. Ad "${adNames[indexes[0]]}" is better than ad "${adNames[indexes[1]]}"`)
            } else {
                alert(`${type} p-value: ${results.pValue.toFixed(3)}. Ad "${adNames[indexes[1]]}" is better than ad "${adNames[indexes[0]]}"`)
            }
        } else {
            alert(`${type} p-value: ${results.pValue.toFixed(3)}. No significant difference.`)
        }
    }

    const impressions = getNums('baseMetrics.impressions')
    const clicks = getNums('baseMetrics.clicks')
    const engagements = getNums('baseMetrics.totalEngagements')
    const names = [...document.querySelectorAll('.ads-table__table tbody .reporting-table-creatives__creative-name')].map(elem => elem.innerText.slice('Name: '.length))
    const ids = [...document.querySelectorAll('.ads-table__table tbody [data-live-test-creative-id]')].map(elem => elem.getAttribute('data-live-test-creative-id'))

    const selectedIndexes = [...document.querySelectorAll('.ads-table__table tbody .ads-table__select-container input[type=checkbox]')].flatMap((checkbox, index) => checkbox.checked ? [index] : [])

    if (selectedIndexes.length != 2) {
        throw new Error('Must select exactly two ads');
    }

    outputResults('clicks', selectedIndexes, impressions, clicks, names)
    outputResults('engagement', selectedIndexes, impressions, engagements, names)
}
