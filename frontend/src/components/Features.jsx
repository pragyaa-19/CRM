const FeatureCard = ({ icon, title, text }) => {
  return (
    // Tailwind classes make styling easy: p-6 means "padding 6", bg-white is background white
    <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{text}</p>
    </div>
  );
};

function Features(){
    return (<section className="max-w-5xl mx-auto mt-32 px-6 pb-20">
        <h2 className="text-3xl font-bold text-center mb-12">Why choose us?</h2>

        {/* grid-cols-3 splits the space into 3 equal columns on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Here we snap in our Lego blocks and pass them different text! */}
          <FeatureCard
            icon="🚀"
            title="Blazing Fast"
            text="Our platform is optimized for speed so you never have to wait."
          />
          <FeatureCard
            icon="🔒"
            title="Super Secure"
            text="Your data is encrypted and stored safely in the cloud."
          />
          <FeatureCard
            icon="📱"
            title="Mobile Ready"
            text="Access your dashboard from your phone, anywhere in the world."
          />
          
        </div>
      </section>
    );
}


export default Features;