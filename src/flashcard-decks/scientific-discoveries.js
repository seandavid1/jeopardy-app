// Scientific Discoveries & Inventors Flash Cards
export const scientificDiscoveries = {
  id: 'scientific-discoveries',
  name: 'Scientific Discoveries & Inventors',
  description: 'Learn famous scientists, inventors, and their discoveries',
  category: 'Science',
  cards: [
    // EASY - Most famous scientists and inventions
    { id: 1, question: 'Who invented the telephone?', answer: 'Alexander Graham Bell', difficulty: 'easy' },
    { id: 2, question: 'Who invented the light bulb?', answer: 'Thomas Edison', difficulty: 'easy' },
    { id: 3, question: 'Who developed the theory of relativity?', answer: 'Albert Einstein', difficulty: 'easy' },
    { id: 4, question: 'Who discovered penicillin?', answer: 'Alexander Fleming', difficulty: 'easy' },
    { id: 5, question: 'Who formulated the laws of motion and gravity?', answer: 'Isaac Newton', difficulty: 'easy' },
    { id: 6, question: 'Who discovered radium and polonium?', answer: 'Marie Curie', difficulty: 'easy' },
    { id: 7, question: 'Who invented the airplane?', answer: 'Wright Brothers (Orville and Wilbur)', difficulty: 'easy' },
    { id: 8, question: 'Who developed the theory of evolution?', answer: 'Charles Darwin', difficulty: 'easy' },
    { id: 9, question: 'Who discovered the structure of DNA?', answer: 'Watson and Crick (with Franklin and Wilkins)', difficulty: 'easy' },
    { id: 10, question: 'Who invented the printing press?', answer: 'Johannes Gutenberg', difficulty: 'easy' },
    { id: 11, question: 'Who invented the steam engine?', answer: 'James Watt', difficulty: 'easy' },
    { id: 12, question: 'Who discovered that the Earth revolves around the Sun?', answer: 'Nicolaus Copernicus', difficulty: 'easy' },
    { id: 13, question: 'Who invented the telegraph?', answer: 'Samuel Morse', difficulty: 'easy' },
    { id: 14, question: 'Who created the first vaccine (for smallpox)?', answer: 'Edward Jenner', difficulty: 'easy' },
    { id: 15, question: 'Who invented dynamite?', answer: 'Alfred Nobel', difficulty: 'easy' },
    
    // MEDIUM - Well-known but requires more knowledge
    { id: 16, question: 'Who discovered X-rays?', answer: 'Wilhelm Röntgen', difficulty: 'medium' },
    { id: 17, question: 'Who invented the cotton gin?', answer: 'Eli Whitney', difficulty: 'medium' },
    { id: 18, question: 'Who developed the polio vaccine?', answer: 'Jonas Salk', difficulty: 'medium' },
    { id: 19, question: 'Who invented the phonograph?', answer: 'Thomas Edison', difficulty: 'medium' },
    { id: 20, question: 'Who discovered the planet Uranus?', answer: 'William Herschel', difficulty: 'medium' },
    { id: 21, question: 'Who developed the periodic table?', answer: 'Dmitri Mendeleev', difficulty: 'medium' },
    { id: 22, question: 'Who discovered the electron?', answer: 'J.J. Thomson', difficulty: 'medium' },
    { id: 23, question: 'Who discovered the neutron?', answer: 'James Chadwick', difficulty: 'medium' },
    { id: 24, question: 'Who discovered the proton?', answer: 'Ernest Rutherford', difficulty: 'medium' },
    { id: 25, question: 'Who developed the first mechanical computer?', answer: 'Charles Babbage', difficulty: 'medium' },
    { id: 26, question: 'Who discovered that blood circulates?', answer: 'William Harvey', difficulty: 'medium' },
    { id: 27, question: 'Who invented the microscope?', answer: 'Zacharias Janssen (or Antonie van Leeuwenhoek)', difficulty: 'medium' },
    { id: 28, question: 'Who discovered electromagnetic induction?', answer: 'Michael Faraday', difficulty: 'medium' },
    { id: 29, question: 'Who created the first successful vaccine (cowpox for smallpox)?', answer: 'Edward Jenner', difficulty: 'medium' },
    { id: 30, question: 'Who proposed that all matter is made of atoms?', answer: 'John Dalton', difficulty: 'medium' },
    { id: 31, question: 'Who discovered radioactivity?', answer: 'Henri Becquerel', difficulty: 'medium' },
    { id: 32, question: 'Who invented the telescope (astronomical)?', answer: 'Galileo Galilei (refined)', difficulty: 'medium' },
    { id: 33, question: 'Who proved that the Earth rotates?', answer: 'Léon Foucault (Foucault pendulum)', difficulty: 'medium' },
    { id: 34, question: 'Who discovered the law of planetary motion?', answer: 'Johannes Kepler', difficulty: 'medium' },
    { id: 35, question: 'Who invented the barometer?', answer: 'Evangelista Torricelli', difficulty: 'medium' },
    
    // HARD - Lesser-known discoveries
    { id: 36, question: 'Who discovered the planet Neptune?', answer: 'Johann Galle (predicted by Le Verrier)', difficulty: 'hard' },
    { id: 37, question: 'Who invented the Geiger counter?', answer: 'Hans Geiger', difficulty: 'hard' },
    { id: 38, question: 'Who developed the uncertainty principle?', answer: 'Werner Heisenberg', difficulty: 'hard' },
    { id: 39, question: 'Who discovered the photoelectric effect?', answer: 'Albert Einstein', difficulty: 'hard' },
    { id: 40, question: 'Who discovered the positron?', answer: 'Carl Anderson', difficulty: 'hard' },
    { id: 41, question: 'Who discovered the structure of benzene?', answer: 'August Kekulé', difficulty: 'hard' },
    { id: 42, question: 'Who developed quantum mechanics?', answer: 'Max Planck', difficulty: 'hard' },
    { id: 43, question: 'Who discovered the Higgs boson?', answer: 'CERN scientists (predicted by Peter Higgs)', difficulty: 'hard' },
    { id: 44, question: 'Who discovered that light is both a wave and particle?', answer: 'Louis de Broglie', difficulty: 'hard' },
    { id: 45, question: 'Who discovered the noble gases?', answer: 'William Ramsay', difficulty: 'hard' },
    { id: 46, question: 'Who invented the cyclotron?', answer: 'Ernest Lawrence', difficulty: 'hard' },
    { id: 47, question: 'Who discovered superconductivity?', answer: 'Heike Kamerlingh Onnes', difficulty: 'hard' },
    { id: 48, question: 'Who discovered cosmic microwave background radiation?', answer: 'Penzias and Wilson', difficulty: 'hard' },
    { id: 49, question: 'Who proposed the Big Bang theory?', answer: 'Georges Lemaître', difficulty: 'hard' },
    { id: 50, question: 'Who discovered the circulation of the lymph system?', answer: 'Gaspare Aselli', difficulty: 'hard' },
    { id: 51, question: 'Who discovered insulin?', answer: 'Frederick Banting and Charles Best', difficulty: 'hard' },
    { id: 52, question: 'Who developed the smallpox eradication campaign?', answer: 'Donald Henderson', difficulty: 'hard' },
    { id: 53, question: 'Who discovered Archimedes\' principle?', answer: 'Archimedes', difficulty: 'hard' },
    { id: 54, question: 'Who discovered atmospheric pressure?', answer: 'Evangelista Torricelli', difficulty: 'hard' },
    { id: 55, question: 'Who discovered that diseases are caused by microorganisms?', answer: 'Louis Pasteur', difficulty: 'hard' },
    { id: 56, question: 'Who invented pasteurization?', answer: 'Louis Pasteur', difficulty: 'hard' },
    { id: 57, question: 'Who discovered the speed of light?', answer: 'Ole Rømer (first measurement)', difficulty: 'hard' },
    { id: 58, question: 'Who invented the Richter scale?', answer: 'Charles Richter', difficulty: 'hard' },
    { id: 59, question: 'Who discovered continental drift?', answer: 'Alfred Wegener', difficulty: 'hard' },
    { id: 60, question: 'Who discovered the composition of water (H2O)?', answer: 'Antoine Lavoisier', difficulty: 'hard' },
  ]
};

export default scientificDiscoveries;




