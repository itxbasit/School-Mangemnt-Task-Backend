
export default function capitalizeUsername(str) {
    const words = str.split(' ');

    // Map over each word and capitalize it
    const capitalizedWords = words.map(word => {
        // Capitalize the first letter and lower the rest
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });

    // Join the array back into a string
    return capitalizedWords.join(' ');
}
