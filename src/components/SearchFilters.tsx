
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState, useEffect } from "react";

interface SearchFiltersProps {
  onFiltersChange: (filters: any) => void;
  initialFilters?: any;
}

const SearchFilters = ({ onFiltersChange, initialFilters }: SearchFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    year: '',
    author: '',
    sortBy: 'date', // Default to date for latest papers
    ...initialFilters
  });

  const categories = [
    { value: 'all', label: 'All categories' },
    
    // Physics
    { value: 'physics', label: '--- PHYSICS ---', disabled: true },
    { value: 'astro-ph', label: 'Astrophysics (General)' },
    { value: 'astro-ph.CO', label: 'Astrophysics - Cosmology and Nongalactic' },
    { value: 'astro-ph.EP', label: 'Astrophysics - Earth and Planetary' },
    { value: 'astro-ph.GA', label: 'Astrophysics - Astrophysics of Galaxies' },
    { value: 'astro-ph.HE', label: 'Astrophysics - High Energy Astrophysical Phenomena' },
    { value: 'astro-ph.IM', label: 'Astrophysics - Instrumentation and Methods' },
    { value: 'astro-ph.SR', label: 'Astrophysics - Solar and Stellar' },
    
    { value: 'cond-mat', label: 'Condensed Matter (General)' },
    { value: 'cond-mat.dis-nn', label: 'Condensed Matter - Disordered Systems and Neural Networks' },
    { value: 'cond-mat.mtrl-sci', label: 'Condensed Matter - Materials Science' },
    { value: 'cond-mat.mes-hall', label: 'Condensed Matter - Mesoscale and Nanoscale Physics' },
    { value: 'cond-mat.other', label: 'Condensed Matter - Other' },
    { value: 'cond-mat.quant-gas', label: 'Condensed Matter - Quantum Gases' },
    { value: 'cond-mat.soft', label: 'Condensed Matter - Soft Condensed Matter' },
    { value: 'cond-mat.stat-mech', label: 'Condensed Matter - Statistical Mechanics' },
    { value: 'cond-mat.str-el', label: 'Condensed Matter - Strongly Correlated Electrons' },
    { value: 'cond-mat.supr-con', label: 'Condensed Matter - Superconductivity' },
    
    { value: 'gr-qc', label: 'General Relativity and Quantum Cosmology' },
    { value: 'hep-ex', label: 'High Energy Physics - Experiment' },
    { value: 'hep-lat', label: 'High Energy Physics - Lattice' },
    { value: 'hep-ph', label: 'High Energy Physics - Phenomenology' },
    { value: 'hep-th', label: 'High Energy Physics - Theory' },
    { value: 'math-ph', label: 'Mathematical Physics' },
    
    { value: 'nlin', label: 'Nonlinear Sciences (General)' },
    { value: 'nlin.AO', label: 'Nonlinear Sciences - Adaptation and Self-Organizing Systems' },
    { value: 'nlin.CG', label: 'Nonlinear Sciences - Cellular Automata and Lattice Gases' },
    { value: 'nlin.CD', label: 'Nonlinear Sciences - Chaotic Dynamics' },
    { value: 'nlin.SI', label: 'Nonlinear Sciences - Exactly Solvable and Integrable Systems' },
    { value: 'nlin.PS', label: 'Nonlinear Sciences - Pattern Formation and Solitons' },
    
    { value: 'nucl-ex', label: 'Nuclear Experiment' },
    { value: 'nucl-th', label: 'Nuclear Theory' },
    { value: 'physics', label: 'Physics (General)' },
    { value: 'physics.acc-ph', label: 'Physics - Accelerator Physics' },
    { value: 'physics.app-ph', label: 'Physics - Applied Physics' },
    { value: 'physics.ao-ph', label: 'Physics - Atmospheric and Oceanic Physics' },
    { value: 'physics.atom-ph', label: 'Physics - Atomic Physics' },
    { value: 'physics.bio-ph', label: 'Physics - Biological Physics' },
    { value: 'physics.chem-ph', label: 'Physics - Chemical Physics' },
    { value: 'physics.class-ph', label: 'Physics - Classical Physics' },
    { value: 'physics.comp-ph', label: 'Physics - Computational Physics' },
    { value: 'physics.data-an', label: 'Physics - Data Analysis, Statistics and Probability' },
    { value: 'physics.flu-dyn', label: 'Physics - Fluid Dynamics' },
    { value: 'physics.gen-ph', label: 'Physics - General Physics' },
    { value: 'physics.geo-ph', label: 'Physics - Geophysics' },
    { value: 'physics.hist-ph', label: 'Physics - History and Philosophy of Physics' },
    { value: 'physics.ins-det', label: 'Physics - Instrumentation and Detectors' },
    { value: 'physics.med-ph', label: 'Physics - Medical Physics' },
    { value: 'physics.optics', label: 'Physics - Optics' },
    { value: 'physics.soc-ph', label: 'Physics - Physics and Society' },
    { value: 'physics.ed-ph', label: 'Physics - Physics Education' },
    { value: 'physics.plasm-ph', label: 'Physics - Plasma Physics' },
    { value: 'physics.pop-ph', label: 'Physics - Popular Physics' },
    { value: 'physics.space-ph', label: 'Physics - Space Physics' },
    { value: 'quant-ph', label: 'Quantum Physics' },
    
    // Mathematics
    { value: 'math', label: '--- MATHEMATICS ---', disabled: true },
    { value: 'math.AG', label: 'Mathematics - Algebraic Geometry' },
    { value: 'math.AT', label: 'Mathematics - Algebraic Topology' },
    { value: 'math.AP', label: 'Mathematics - Analysis of PDEs' },
    { value: 'math.CT', label: 'Mathematics - Category Theory' },
    { value: 'math.CA', label: 'Mathematics - Classical Analysis and ODEs' },
    { value: 'math.CO', label: 'Mathematics - Combinatorics' },
    { value: 'math.AC', label: 'Mathematics - Commutative Algebra' },
    { value: 'math.CV', label: 'Mathematics - Complex Variables' },
    { value: 'math.DG', label: 'Mathematics - Differential Geometry' },
    { value: 'math.DS', label: 'Mathematics - Dynamical Systems' },
    { value: 'math.FA', label: 'Mathematics - Functional Analysis' },
    { value: 'math.GM', label: 'Mathematics - General Mathematics' },
    { value: 'math.GN', label: 'Mathematics - General Topology' },
    { value: 'math.GT', label: 'Mathematics - Geometric Topology' },
    { value: 'math.GR', label: 'Mathematics - Group Theory' },
    { value: 'math.HO', label: 'Mathematics - History and Overview' },
    { value: 'math.IT', label: 'Mathematics - Information Theory' },
    { value: 'math.KT', label: 'Mathematics - K-Theory and Homology' },
    { value: 'math.LO', label: 'Mathematics - Logic' },
    { value: 'math.MG', label: 'Mathematics - Metric Geometry' },
    { value: 'math.NT', label: 'Mathematics - Number Theory' },
    { value: 'math.NA', label: 'Mathematics - Numerical Analysis' },
    { value: 'math.OA', label: 'Mathematics - Operator Algebras' },
    { value: 'math.OC', label: 'Mathematics - Optimization and Control' },
    { value: 'math.PR', label: 'Mathematics - Probability' },
    { value: 'math.QA', label: 'Mathematics - Quantum Algebra' },
    { value: 'math.RT', label: 'Mathematics - Representation Theory' },
    { value: 'math.RA', label: 'Mathematics - Rings and Algebras' },
    { value: 'math.SP', label: 'Mathematics - Spectral Theory' },
    { value: 'math.ST', label: 'Mathematics - Statistics Theory' },
    { value: 'math.SG', label: 'Mathematics - Symplectic Geometry' },
    
    // Computer Science
    { value: 'cs', label: '--- COMPUTER SCIENCE ---', disabled: true },
    { value: 'cs.AI', label: 'Computer Science - Artificial Intelligence' },
    { value: 'cs.CL', label: 'Computer Science - Computation and Language' },
    { value: 'cs.CC', label: 'Computer Science - Computational Complexity' },
    { value: 'cs.CE', label: 'Computer Science - Computational Engineering, Finance, and Science' },
    { value: 'cs.CG', label: 'Computer Science - Computational Geometry' },
    { value: 'cs.GT', label: 'Computer Science - Computer Science and Game Theory' },
    { value: 'cs.CV', label: 'Computer Science - Computer Vision and Pattern Recognition' },
    { value: 'cs.CY', label: 'Computer Science - Computers and Society' },
    { value: 'cs.CR', label: 'Computer Science - Cryptography and Security' },
    { value: 'cs.DS', label: 'Computer Science - Data Structures and Algorithms' },
    { value: 'cs.DB', label: 'Computer Science - Databases' },
    { value: 'cs.DL', label: 'Computer Science - Digital Libraries' },
    { value: 'cs.DM', label: 'Computer Science - Discrete Mathematics' },
    { value: 'cs.DC', label: 'Computer Science - Distributed, Parallel, and Cluster Computing' },
    { value: 'cs.ET', label: 'Computer Science - Emerging Technologies' },
    { value: 'cs.FL', label: 'Computer Science - Formal Languages and Automata Theory' },
    { value: 'cs.GL', label: 'Computer Science - General Literature' },
    { value: 'cs.GR', label: 'Computer Science - Graphics' },
    { value: 'cs.AR', label: 'Computer Science - Hardware Architecture' },
    { value: 'cs.HC', label: 'Computer Science - Human-Computer Interaction' },
    { value: 'cs.IR', label: 'Computer Science - Information Retrieval' },
    { value: 'cs.IT', label: 'Computer Science - Information Theory' },
    { value: 'cs.LO', label: 'Computer Science - Logic in Computer Science' },
    { value: 'cs.LG', label: 'Computer Science - Machine Learning' },
    { value: 'cs.MS', label: 'Computer Science - Mathematical Software' },
    { value: 'cs.MA', label: 'Computer Science - Multiagent Systems' },
    { value: 'cs.MM', label: 'Computer Science - Multimedia' },
    { value: 'cs.NI', label: 'Computer Science - Networking and Internet Architecture' },
    { value: 'cs.NE', label: 'Computer Science - Neural and Evolutionary Computing' },
    { value: 'cs.NA', label: 'Computer Science - Numerical Analysis' },
    { value: 'cs.OS', label: 'Computer Science - Operating Systems' },
    { value: 'cs.OH', label: 'Computer Science - Other Computer Science' },
    { value: 'cs.PF', label: 'Computer Science - Performance' },
    { value: 'cs.PL', label: 'Computer Science - Programming Languages' },
    { value: 'cs.RO', label: 'Computer Science - Robotics' },
    { value: 'cs.SI', label: 'Computer Science - Social and Information Networks' },
    { value: 'cs.SE', label: 'Computer Science - Software Engineering' },
    { value: 'cs.SD', label: 'Computer Science - Sound' },
    { value: 'cs.SC', label: 'Computer Science - Symbolic Computation' },
    { value: 'cs.SY', label: 'Computer Science - Systems and Control' },
    
    // Biology
    { value: 'q-bio', label: '--- QUANTITATIVE BIOLOGY ---', disabled: true },
    { value: 'q-bio.BM', label: 'Quantitative Biology - Biomolecules' },
    { value: 'q-bio.CB', label: 'Quantitative Biology - Cell Behavior' },
    { value: 'q-bio.GN', label: 'Quantitative Biology - Genomics' },
    { value: 'q-bio.MN', label: 'Quantitative Biology - Molecular Networks' },
    { value: 'q-bio.NC', label: 'Quantitative Biology - Neurons and Cognition' },
    { value: 'q-bio.OT', label: 'Quantitative Biology - Other' },
    { value: 'q-bio.PE', label: 'Quantitative Biology - Populations and Evolution' },
    { value: 'q-bio.QM', label: 'Quantitative Biology - Quantitative Methods' },
    { value: 'q-bio.SC', label: 'Quantitative Biology - Subcellular Processes' },
    { value: 'q-bio.TO', label: 'Quantitative Biology - Tissues and Organs' },
    
    // Finance
    { value: 'q-fin', label: '--- QUANTITATIVE FINANCE ---', disabled: true },
    { value: 'q-fin.CP', label: 'Quantitative Finance - Computational Finance' },
    { value: 'q-fin.EC', label: 'Quantitative Finance - Economics' },
    { value: 'q-fin.GN', label: 'Quantitative Finance - General Finance' },
    { value: 'q-fin.MF', label: 'Quantitative Finance - Mathematical Finance' },
    { value: 'q-fin.PM', label: 'Quantitative Finance - Portfolio Management' },
    { value: 'q-fin.PR', label: 'Quantitative Finance - Pricing of Securities' },
    { value: 'q-fin.RM', label: 'Quantitative Finance - Risk Management' },
    { value: 'q-fin.ST', label: 'Quantitative Finance - Statistical Finance' },
    { value: 'q-fin.TR', label: 'Quantitative Finance - Trading and Market Microstructure' },
    
    // Statistics
    { value: 'stat', label: '--- STATISTICS ---', disabled: true },
    { value: 'stat.AP', label: 'Statistics - Applications' },
    { value: 'stat.CO', label: 'Statistics - Computation' },
    { value: 'stat.ML', label: 'Statistics - Machine Learning' },
    { value: 'stat.ME', label: 'Statistics - Methodology' },
    { value: 'stat.OT', label: 'Statistics - Other Statistics' },
    { value: 'stat.TH', label: 'Statistics - Statistics Theory' },
    
    // Engineering
    { value: 'eess', label: '--- ENGINEERING ---', disabled: true },
    { value: 'eess.AS', label: 'Engineering - Audio and Speech Processing' },
    { value: 'eess.IV', label: 'Engineering - Image and Video Processing' },
    { value: 'eess.SP', label: 'Engineering - Signal Processing' },
    { value: 'eess.SY', label: 'Engineering - Systems and Control' },
    
    // Economics
    { value: 'econ', label: '--- ECONOMICS ---', disabled: true },
    { value: 'econ.EM', label: 'Economics - Econometrics' },
    { value: 'econ.GN', label: 'Economics - General Economics' },
    { value: 'econ.TH', label: 'Economics - Theoretical Economics' },
  ];

  useEffect(() => {
    if (initialFilters) {
      setFilters(prev => ({ ...prev, ...initialFilters }));
    }
  }, [initialFilters]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {(filters.category !== 'all' || filters.year || filters.author || filters.sortBy !== 'date') && (
            <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
              Active
            </span>
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent className="max-h-96 overflow-y-auto">
                {categories.map((cat) => (
                  <SelectItem 
                    key={cat.value} 
                    value={cat.value}
                    disabled={cat.disabled}
                    className={cat.disabled ? "font-semibold text-gray-700 bg-gray-100" : ""}
                  >
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              placeholder="e.g., 2024"
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              placeholder="Author name"
              value={filters.author}
              onChange={(e) => handleFilterChange('author', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="sortBy">Sort by</Label>
            <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date (Latest First)</SelectItem>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="citations">Citations</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Filter Reset Button */}
        {(filters.category !== 'all' || filters.year || filters.author || filters.sortBy !== 'date') && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const resetFilters = {
                  category: 'all',
                  year: '',
                  author: '',
                  sortBy: 'date'
                };
                setFilters(resetFilters);
                onFiltersChange(resetFilters);
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default SearchFilters;
